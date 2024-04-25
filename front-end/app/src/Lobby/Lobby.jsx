import { forwardRef, useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import Video from "../Video/Video";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";
import { io } from 'socket.io-client';


export default function Lobby(porps) {
 
  const videoRef = useRef(null)
  const [stream,setStream] = useState();


  function handleVideo(){
    console.log(videoRef)

    playVideoFromCamera().then(data => {
      console.log(videoRef)
      setStream(data)
      videoRef.current.srcObject =data;
   })
  }

  function handleStop(){
    if(stream) {
      // console.log(videoRef.current.srcObject,videoRef.current.srcObject.getTracks())
      console.log('inside if candition')
      console.log(stream.getTracks())
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject =null;
    }
  }

  useEffect(()=> {
    console.log("on mount --------------------")
    handleVideo()
    const socket = io('http://localhost:3000')
    console.log(socket)
    socket.on('connection',(data)=>{
      console.log("connected to server")
    })
    // debugger
    return function () {
      if(socket){
        socket.close()
      }
      console.log("on unmount ------------------")
      console.log(stream) 
      if(stream) {
        // console.log(videoRef.current.srcObject,videoRef.current.srcObject.getTracks())
        socket.disconnect()
        stream.getTracks().forEach(t => {
          t.stop()
          t.enabled = false;
        })

      }
    
    }
  },[])

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className='flex flex-row'>
        <div className='justifiy-self-auto mx-8 '>
          <UserList className="p-3 text-left" />
          <button className="bg-red-500 w-full text-white">Exit</button>
        </div>
        {/* <Video ></Video> */}
        <div className="flex flex-col">
        <video ref={videoRef} autoPlay playsInline></video>
        {/* <video autoPlay playsInline></video> */}
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleVideo}>Start</button>

        </div>
        
        {/* <button onClick={handleVideo}>get video</button> */}

      </div>
      </div>
  )
}

