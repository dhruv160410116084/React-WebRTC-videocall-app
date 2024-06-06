import { forwardRef, useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import Video from "../Video/Video";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";
import { socket } from "../socket"


const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
let count = 0

export default function Lobby(porps) {

  const videoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [stream, setStream] = useState();
  const [remote, setRemote] = useState();

  const location = useLocation();


  async function makeCall(member) {
    try {
      const remoteStream = new MediaStream();
      remoteVideoRef.current.srcObject = remoteStream;
  
      const peerConnection = new RTCPeerConnection(configuration);
  
      // Add the ontrack event listener before setting up the offer/answer
      peerConnection.addEventListener('track', (event) => {
        console.log("Remote track received:", event);
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
      });
  
      // Adding local tracks to the peer connection
      stream.getTracks().forEach((track) => {
        console.log("Adding track:", track);
        peerConnection.addTrack(track, stream);
      });
  
      socket.on('answer', async message => {
        console.log('Answer received:', message);
        if (message.answer) {
          const remoteDesc = new RTCSessionDescription(message.answer);
          await peerConnection.setRemoteDescription(remoteDesc);
        }
      });
  
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
  
      socket.emit('offer', { member, offer });
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          socket.emit('candidate', { 'candidate': event.candidate });
        }
      };
  
      peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
          console.log('Peers connected');
        }
      });
  
    } catch (error) {
      console.log("Error in makeCall:", error);
    }
  }

  
  function handleVideo() {
    console.log(videoRef,socket.io)
    let cam=0
    if(location.state.userName == 'webcam'){
      count++;
      cam=0
    }else if(location.state.userName == 'cam'){
      count ++
      cam =1
    }

    playVideoFromCamera(cam).then(data => {
      console.log(videoRef)
      setStream(data)
      videoRef.current.srcObject = data;
    })
  }



  function handleStop() {
    if (stream) {
      // console.log(videoRef.current.srcObject,videoRef.current.srcObject.getTracks())
      console.log('inside if candition')
      console.log(stream.getTracks())
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    console.log("Component mounted");
    handleVideo();
    const remoteStream = new MediaStream();
    const peerConnection = new RTCPeerConnection(configuration);
    remoteVideoRef.current.srcObject = remoteStream;
  
    // Add the ontrack event listener
    peerConnection.addEventListener('track', (event) => {
      console.log("Remote track received:", event);
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    });
  
    socket.on('offer', async message => {
      console.log("Offer received:", message);
      if (message.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { receiver: message.sender, 'answer': answer });
      }
    });
  
    socket.on('candidate', async function (data) {
      try {
        if (data.candidate) {
          await peerConnection.addIceCandidate(data.candidate);
        }
      } catch (error) {
        console.log("Error adding received ice candidate", error);
      }
    });
  
    peerConnection.addEventListener('connectionstatechange', event => {
      if (peerConnection.connectionState === 'connected') {
        console.log("Peer connected");
      }
    });
  
    socket.emit('user-data', location.state.userName);
  
    return function cleanup() {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      // Clean up any remaining event listeners
      socket.off('offer');
      socket.off('candidate');
      socket.off('answer');
    };
  }, []);
  

  return (
    <div className="flex flex-col">
      <NavBar userName={location.state.userName} />
      <div className='flex flex-row'>
        <div className='justifiy-self-auto mx-8 '>
          <UserList className="p-3 text-left" socket={socket} makeCall={makeCall} />
          <button className="bg-red-500 w-full text-white">Exit</button>
        </div>
        {/* <Video ></Video> */}
        <div className="flex flex-col">
          <video ref={videoRef} autoPlay playsInline></video>
          <video autoPlay playsInline ref={remoteVideoRef}></video>
          {/* <input type="text" name="remote-offer" id="" placeholder="Enter webrtc offer here" /> */}
          {/* <button name="remote-submit" onClick={}> Enter SDP</button> */}
          <button onClick={handleStop}>Stop</button>
          <button onClick={handleVideo}>Start</button>

        </div>

        {/* <button onClick={handleVideo}>get video</button> */}

      </div>
    </div>
  )
}

