import { forwardRef, useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import Video from "../Video/Video";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";
import { socket } from "../socket"

'use strict';
const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
let count = 0
let pc;
let localStream;
let remoteSocketId=null;

export default function Lobby(props) {
  const videoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [stream, setStream] = useState('');

  const location = useLocation();


  function handleVideo() {
    try {

      playVideoFromCamera().then(data => {
        // console.log('[handle video() ]stream data', data)
        setStream(data)
        // console.log('state: ',stream)
        videoRef.current.srcObject = data;
        localStream = data;
        // setStream(data)
        return data;
      })
      // console.log(videoRef)
    } catch (error) {
      console.log(error)
    }
  }
  function createConnection() {

    pc = new RTCPeerConnection(configuration);
    pc.onicecandidate = e => {
      console.log("Ice candidate: ", e.candidate)
      if (e.candidate) {
        socket.emit('candidate', { receiver:remoteSocketId,'candidate': e.candidate });
      }
    };
    pc.ontrack = e => {
      console.log(e, 'remote track received   ------------->',remoteVideoRef.current.srcObject)
      remoteVideoRef.current.srcObject = e.streams[0]
      console.log(e, 'remote track received   ------------->',remoteVideoRef.current.srcObject)

    };

    pc.addEventListener('connectionstatechange', event => {
      if (pc.connectionState === 'connected') {
        console.log('Peers connected');
       
      }
    });
    console.log(stream)


    if (stream) {
      console.log(stream.getTracks())
      stream.getTracks().forEach(track => pc.addTrack(track,stream))
    } else {
      playVideoFromCamera().then(data => {
        // console.log('[handle video() ]stream data', data)
        setStream(data)
        // console.log('state: ',stream)
        videoRef.current.srcObject = data;

        setStream(data)
        data.getTracks().forEach(track => pc.addTrack(track,data))
        return data;
      })
    }
    // console.log('----------pc--------',pc)


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
    // debugger



    handleVideo()
    console.log('----------------------rerender')
    socket.emit('user-data', location.state.userName);

    socket.on('offer', async message => {
      // debugger
      console.log("Offer received:", message);
      if (message.offer) {
        // handleVideo();
        if (pc) {
          return
        }

        await createConnection()
        await pc.setRemoteDescription(message.offer);
        const answer = await pc.createAnswer();
        socket.emit('answer', { receiver: message.sender, 'answer': answer });
        await pc.setLocalDescription(answer);
      }
    });

    socket.on('answer', async message => {
      try {
        console.log("answer received:", message.answer)
        console.log(pc)
        if (!pc) {
          console.error('no peerconnection');
          return;
        }
        console.log(pc.remoteDescription)
        // if (!pc.remoteDescription) {
          await pc.setRemoteDescription(message.answer);
          console.log('remote description set', pc)
        // }
      } catch (error) {
        console.error(error)
      }

    })

    socket.on('candidate', async message => {
      console.log('received: ', message.candidate)
      if (!pc) {
        console.error('no peerconnection');
        return;
      }
      // if (!message.candidate) {
      //   await pc.addIceCandidate(null);
      // } else {
        await pc.addIceCandidate(message.candidate);
      // }

    })


    return function cleanup() {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      socket.off('offer');
      socket.off('answer');
      socket.off('candidate');
      pc.close()
    };
  }, [])


  async function makeCall(member) {
    remoteSocketId=member
    await createConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log(pc)
    socket.emit('offer', { member, offer })

  }
  return (
    <div className="flex flex-col">
      <NavBar userName={location.state.userName} />
      <div className='flex flex-row'>
        <div className='justifiy-self-auto mx-8 '>
          <UserList className="p-3 text-left" socket={socket} makeCall={makeCall} />
          <button className="bg-red-500 w-full text-white">Exit</button>
        </div>
        <div className="flex flex-row">
          <video ref={videoRef} autoPlay playsInline></video>
          <video autoPlay playsInline ref={remoteVideoRef}></video>
        </div>
      </div>
    </div>
  )
}

