import { useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";
import MediaControl from "../MediaControl";
import { ToastContainer, toast } from 'react-toastify';
import CallToast from "../CallToast";
import IncomingCallToast from "../IncomingCallToast";
import MissedCallToast from "../MissedCallToast";
import { Chat } from "../Chat";

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
let pc = null;
let localStream = null;
let remotePc = null;
let remoteSocketId = null;
let dataChannel = null;


export default function Lobby(props) {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const location = useLocation();
  const [pcState, setPcState] = useState(null);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [userList, setUserList] = useState([]);
  const incomingCallToastRef = useRef(null);
  const callToastRef = useRef(null);
  const [isOnCall, setIsOnCall] = useState(false);
  const [chatList, setChatList] = useState([]);

  let fileName = null;
let fileSize = 0;
let receiveBuffer = [];
let receivedSize = 0

  let fileSocketId = null;
  let downloadRef = useRef(null);

// console.log('fileName: --------------------',fileName)

  useEffect(() => {
    handleVideo();
    setupSocketListeners();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (dataChannel) {
      dataChannel.onmessage = (event) => {
        // console.log('Message received: ', event.data, event.data?.type);
        try {
          if (event.data?.byteLength) {
            receiveBuffer.push(event.data)
            receivedSize += event.data.byteLength
            // console.log(receivedSize, fileSize)
            if (receivedSize === fileSize) {
              const received = new Blob(receiveBuffer)
              receiveBuffer = []
              receivedSize = 0
              downloadRef.current.href = URL.createObjectURL(received)
              // console.log(downloadRef.current.href)
              downloadRef.current.download = fileName
              downloadRef.current.click();
              // console.log('before setting list: ',fileName,fileSize)
              let _fileName = fileName;
              let _fileSize = fileSize
              setChatList((prevChatList) => [...prevChatList, {
                type: 'file-metadata',
                user: { socketId: fileSocketId },
                fileName: _fileName,
                fileSize: _fileSize,
                time: new Date()
              }])
              fileName = null;
              fileSize = 0
              fileSocketId = null
            }

          } else {
            let data = JSON.parse(event.data);
            // data = JSON.parse(data.data)
            // console.log('eventtttt', data)
            if (data?.type === 'file-metadata') {
              fileName = data.name;
              fileSize = data.size
              fileSocketId = data.socketId;
              // console.log(fileName, fileSize, event.data.data)


            } else if(data?.type === 'test'){
              console.log('test')
          } else {
              setChatList((prevChatList) => [...prevChatList, data]);

            }
          }

        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };

      dataChannel.onopen = () => {
        if (dataChannel.readyState === 'open') {
          console.log("Data channel is open");
          dataChannel.send(JSON.stringify({type:'test'}))

        }
      };
    }
  }, [dataChannel]);

  const setupDataChannel = () => {
    if (dataChannel) {
      dataChannel.onmessage = (event) => {
        // console.log('Message received: ', event.data, event.data?.type);
        try {
          if (event.data?.byteLength) {
            receiveBuffer.push(event.data)
            receivedSize += event.data.byteLength
            // console.log(receivedSize, fileSize)
            if (receivedSize === fileSize) {
              const received = new Blob(receiveBuffer)
              receiveBuffer = []
              receivedSize = 0
              downloadRef.current.href = URL.createObjectURL(received)
              // console.log(downloadRef.current.href)
              downloadRef.current.download = fileName
              downloadRef.current.click();
              let _fileName = fileName;
              let _fileSize = fileSize
              setChatList((prevChatList) => [...prevChatList, {
                type: 'file-metadata',
                user: { socketId: fileSocketId },
                fileName: _fileName,
                fileSize: _fileSize,
                time: new Date()
              }])
              fileName = null;
              fileSize = 0
              fileSocketId = null
            }

          } else {
            let data = JSON.parse(event.data);
            // data = JSON.parse(data.data)
            // console.log('eventtttt', data)
            if (data?.type === 'file-metadata') {
              fileName = data.name;
              fileSize = data.size
              fileSocketId = data.socketId;
              // console.log(fileName, fileSize, event.data.data)


            } else if(data?.type === 'test'){
                console.log('test')
            }else {
              setChatList((prevChatList) => [...prevChatList, data]);

            }
          }

        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };

      dataChannel.onopen = () => {
        if (dataChannel.readyState === 'open') {
          console.log("Data channel is open");
        }
      };
    }

  };

  const makeWebRTCCall = async (member) => {
    remoteSocketId = member;
    let _pc = await createConnection();
    setPcState(_pc);

    dataChannel = pc.createDataChannel('data');
    setupDataChannel();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('offer', { member, offer });
  };

  const handleVideo = async (deviceId) => {
    try {
      const stream = await playVideoFromCamera(deviceId, isMicOn);
      setStream(stream);
      videoRef.current.srcObject = stream;
      localStream = stream;

      if (isOnCall && localStream) {
        localStream.getTracks().forEach(track => {
          let senders = pc.getSenders().find(s => s.track.kind === track.kind);
          if (senders) {
            senders.replaceTrack(track);
          }
        });
      }
    } catch (error) {
      toast('Error in opening video camera')

      console.error("Error accessing media devices.", error);
    }
  };

  const setupSocketListeners = () => {
    socket.emit('user-data', { data: location.state });

    socket.on('offer', async message => {
      if (message.offer) {
        remotePc = await createConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        remoteSocketId = message.sender;
        // console.log('in offer setting channel---');
        pc.ondatachannel = (event) => {
          dataChannel = event.channel
          setupDataChannel();
          dataChannel.send(JSON.stringify({type:'test'}))


        }

        socket.emit('answer', { receiver: message.sender, answer });
      }
    });

    socket.on('answer', async message => {
      if (message.answer && pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
      }
    });

    socket.on('candidate', async message => {
      if (message.candidate && pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
        }
      }
    });

    socket.on('incoming-call', (data) => {
      incomingCallToastRef.current = toast(<IncomingCallToast userName={data.data.userName} userId={data.id} makeWebRTCCall={makeWebRTCCall} />);
    });

    socket.on('deny-call', data => {
      toast.dismiss(incomingCallToastRef.current);
      toast(<MissedCallToast userName={data.data.userName} />, { autoClose: 3000 });
    });

    socket.on('cancel-call', data => {
      toast.dismiss(incomingCallToastRef.current);
      toast(`Missed Call from ${data.data.userName}`, { autoClose: 3000 });
    });

    socket.on('call-accept', (data) => {
      toast.dismiss(callToastRef.current);
    });
  };

  const createConnection = async () => {
    if (!pc) {
      pc = new RTCPeerConnection(configuration);

      pc.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('candidate', { receiver: remoteSocketId, candidate: event.candidate });
        }
      };

      pc.ontrack = event => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setIsOnCall(true);
        } else if (pc.connectionState === 'disconnected') {
          toast(<h2>Call ended</h2>, { autoClose: 3000 });
          cleanup();
        }
      };

      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }
      return pc;
    }
  };

  const makeCall = (member) => {
    socket.emit('call', { id: member });
    let user = userList.find(e => e.socketId === member);
    callToastRef.current = toast(<CallToast userName={user.userName} id={user.socketId} />, {});
  };

  const cleanup = () => {
    setIsOnCall(false);
    setChatList([])
    if (pc) {
      pc.close();
      pc = null;
    }

    if(dataChannel){
      dataChannel.close();
    }
    socket.off('offer');
    socket.off('answer');
    socket.off('candidate');
  };

  return (
    <div className="w-full h-screen flex flex-col">
    <NavBar userName={location.state.userName} profile={location.state.profile} />
    <div className="flex flex-row relative" style={{maxHeight:'calc(100% - 3rem)'}}>
      <div className="w-1/5 justify-self-auto mx-0 " >
        <UserList className="text-left" socket={socket} makeCall={makeCall} userList={userList} setUserList={setUserList} />
      </div>
      <div className={`w-3/5 flex flex-col justify-center bg-gray-200 ${isOnCall && 'relative'}`}>
        <video autoPlay playsInline ref={remoteVideoRef} className={`${!isOnCall ? 'hidden' : ''} w-full h-full`} />
        <video ref={videoRef} autoPlay playsInline style={{ display: isCamOn ? 'block' : 'none' }} muted className={`${isOnCall ? 'absolute top-0 right-0 h-1/5 rounded-bl-lg border-2 border border-indigo-600' : 'h-full w-full'}`} />
        <img src={ location.state.profile} style={{ display: !isCamOn ? 'block' : 'none' }} className="w-full h-full object-cover" />
      </div>
      {isOnCall && <Chat dc={dataChannel} chatList={chatList} setChatList={setChatList} isOnCall={isOnCall}/>}
    </div>
  
    <div className="self-center absolute bottom-0">
      <MediaControl
        videoElemRef={videoRef}
        cleanup={cleanup}
        localStream={localStream}
        handleVideo={handleVideo}
        pc={pcState}
        remotePc={remotePc}
        isCamOn={isCamOn}
        setIsCamOn={setIsCamOn}
        isMicOn={isMicOn}
        setIsMicOn={setIsMicOn}
        isOnCall={isOnCall}
      />
    </div>
    <ToastContainer autoClose={10000} />
    <a href="" hidden ref={downloadRef}></a>
  </div>
  
  )
}
