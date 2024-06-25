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


const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
let pc = null;
let localStream = null;
let remotePc = null;
let remoteSocketId = null;

export default function Lobby(props) {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const location = useLocation();
  const [pcState, setPcState] = useState(null)
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [userList, setUserList] = useState([]);
  let incomingCallToastRef = useRef(null)
  let callToastRef = useRef(null)
  const [isOnCall,setIsOnCall] = useState(false)



  const makeWebRTCCall = async (member) => {
    remoteSocketId = member;
    let _pc = await createConnection();
    setPcState(_pc)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { member, offer });
  };

  useEffect(() => {
    handleVideo();
    setupSocketListeners();



    return () => {
      cleanup();
    };
  }, []);





  const handleVideo = async (deviceId) => {
    try {
      const stream = await playVideoFromCamera(deviceId,isMicOn);
      setStream(stream);
      console.log('stream id -------------')
      console.log(stream.getVideoTracks()[0].getCapabilities())
      videoRef.current.srcObject = stream;
      localStream = stream;

      if(isOnCall){
        console.log('re-adding tracks')
      if (localStream) {
        localStream.getTracks().forEach(track =>{
          let senders = pc.getSenders().find(s => s.track.kind === track.kind)
          console.log(senders)
          senders.replaceTrack(track)
        });
      }
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const setupSocketListeners = () => {
    socket.emit('user-data', { data: location.state });

    socket.on('offer', async message => {
      console.log("Offer received:", message);
      if (message.offer) {
        remotePc = await createConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        remoteSocketId = message.sender
        socket.emit('answer', { receiver: message.sender, answer });
      }
    });

    socket.on('answer', async message => {
      console.log("Answer received:", message);
      if (message.answer && pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
      }
    });

    socket.on('candidate', async message => {
      console.log('Candidate received:', message.candidate);
      if (message.candidate && pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
        }
      }
    });
    socket.on('incoming-call', (data) => {
      console.log('incoming call from ', data);

      incomingCallToastRef.current = toast(<IncomingCallToast
        userName={data.data.userName}
        userId={data.id}
        makeWebRTCCall={makeWebRTCCall} />)
    })
    socket.on('deny-call', data => {
      toast.dismiss(incomingCallToastRef.current)
      toast(<MissedCallToast userName={data.data.userName} />, { autoClose: 3000 })
    })

socket.on('cancel-call', data => {
      toast.dismiss(incomingCallToastRef.current)
      toast(`Missed Call from ${data.data.userName}`, { autoClose: 3000 })
    })
    socket.on('call-accept', (data)=>{
      toast.dismiss(callToastRef.current)
    })


  };

  const createConnection = async () => {
    if (!pc) {
      pc = new RTCPeerConnection(configuration);

      pc.onicecandidate = event => {
        console.log('generate Ice candidate', event.candidate)
        if (event.candidate) {
          socket.emit('candidate', { receiver: remoteSocketId, candidate: event.candidate });
        }
      };

      pc.ontrack = event => {
        console.log('videtrack')
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(pc.connectionState )
        if (pc.connectionState === 'connected') {
          console.log('Peers connected',remoteVideoRef.current.className);
          // remoteVideoRef.current.className.replace('hidden','')
          // remoteVideoRef.current.className = 'block'
          // remoteVideoRef.current.className='block'
          setIsOnCall(true)
        }else if(pc.connectionState === 'disconnected'){
          toast(<h2>Call ended</h2>,{autoClose:3000})
           
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
    // remoteSocketId = member;
    socket.emit('call', { id: member })
    console.log(userList)
    let user = userList.find(e => e.socketId === member ? e.userName : null)
    console.log(user)
    callToastRef.current= toast(<CallToast userName={user.userName} id={user.socketId}/>, {})


  }



  const cleanup = () => {
    setIsOnCall(false)
    // if (localStream) {
    //   // localStream.getTracks().forEach(track => track.stop());
    // }
    if (pc) {
      pc.close();
      pc = null;
    }
    socket.off('offer');
    socket.off('answer');
    socket.off('candidate');
  };


  console.log(location.state)
  return (
    <div className="h-dvh w-full flex flex-col">
      <NavBar userName={location.state.userName} profile={location.state.profile} />
      <div className='flex flex-row h-full relative'>
        <div className='w-1/5 justifiy-self-auto mx-0 '>
          <UserList className=" text-left" socket={socket} makeCall={makeCall} userList={userList}
            setUserList={setUserList}
          />
        </div>
        <div className={`w-3/5 flex flex-row justify-center bg-gray-200 ${isOnCall && 'relative'}`}>
        <video autoPlay playsInline ref={remoteVideoRef} className={ ` ${!isOnCall ? 'hidden' : '' } `}></video>
          <video ref={videoRef} autoPlay playsInline style={{ display: isCamOn ? 'block' : 'none' }}  className={`${isOnCall ? 'absolute top-0 right-0 h-1/5 rounded-bl-lg border-2 border border-indigo-600'  :''}`}
            ></video>
          <img src={'https://avatar.iran.liara.run/public/boy?username=' + location.state.username} style={{ display: !isCamOn ? 'block' : 'none' }} />
          
        </div>
        <div className="border-x-blue-200 w-1/5">
          <h2 className="text-2xl">Upcoming Features</h2>
          <ul className="text-left mx-6" style={{listStyle:'outside'}}>
            <li>Realtime Chat</li>
            <li>Peer-to-Peer file transfer</li>
            <li>Group Video Calls</li>
          </ul>
</div>
      </div>
   
      <div className="self-center absolute bottom-0 ">
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
      <ToastContainer autoClose={false} />
    </div>
  );
}
