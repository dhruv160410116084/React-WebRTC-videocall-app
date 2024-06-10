import { useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";
import { socket } from "../socket";
import MediaControl from "../MediaControl";

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
let pc = null;
let localStream = null;
let remoteSocketId = null;

export default function Lobby(props) {
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const location = useLocation();

  useEffect(() => {
    handleVideo();
    setupSocketListeners();

    return () => {
      cleanup();
    };
  }, []);

  const handleVideo = async () => {
    try {
      const stream = await playVideoFromCamera();
      setStream(stream);
      videoRef.current.srcObject = stream;
      localStream = stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const setupSocketListeners = () => {
    socket.emit('user-data', location.state.userName);

    socket.on('offer', async message => {
      console.log("Offer received:", message);
      if (message.offer) {
        await createConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        remoteSocketId=message.sender
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
  };

  const createConnection = async () => {
    if (!pc) {
      pc = new RTCPeerConnection(configuration);

      pc.onicecandidate = event => {
        console.log('generate Ice candidate',event.candidate)
        if (event.candidate) {
          socket.emit('candidate', { receiver: remoteSocketId   , candidate: event.candidate });
        }
      };

      pc.ontrack = event => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          console.log('Peers connected');
          remoteVideoRef.current.className='block'
        }
      };

      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }
    }
  };

  const makeCall = async (member) => {
    remoteSocketId = member;
    await createConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { member, offer });
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pc) {
      pc.close();
      pc = null;
    }
    socket.off('offer');
    socket.off('answer');
    socket.off('candidate');
  };

  return (
    <div className="h-dvh w-full flex flex-col">
      <NavBar userName={location.state.userName} />
      <div className='flex flex-row w-full'>
        <div className='w-1/5 justifiy-self-auto mx-8 '>
          <UserList className="p-3 text-left" socket={socket} makeCall={makeCall} />
        </div>
        <div className="w-4/5 flex flex-row justify-center bg-gray-200">
          <video ref={videoRef} autoPlay playsInline></video>
          <video autoPlay playsInline ref={remoteVideoRef} className="hidden"></video>
        </div>
      </div>
      <div className="self-center">
      <MediaControl />

      </div>
    </div>
  );
}
