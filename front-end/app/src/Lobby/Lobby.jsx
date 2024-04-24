import { forwardRef, useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import Video from "../Video/Video";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";

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
      stream.getTracks().forEach(t => t.stop())

    }
  }

  useEffect(()=> {
    console.log("on mount --------------------")
    handleVideo()
    debugger
    return function () {
      console.log("on unmount ------------------")
      console.log(stream) 
      if(stream) {
        // console.log(videoRef.current.srcObject,videoRef.current.srcObject.getTracks())
        stream.getTracks().forEach(t => t.stop())

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
        </div>
        
        {/* <button onClick={handleVideo}>get video</button> */}

      </div>
      </div>
  )
}

