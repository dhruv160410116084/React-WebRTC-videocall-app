import { forwardRef, useEffect, useRef, useState } from "react";
import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import Video from "../Video/Video";
import { playVideoFromCamera } from "../helper/webrtc";
import { useLocation } from "react-router-dom";

export default function Lobby(porps) {
 
  const videoRef = useRef(null)

  function handleVideo(){
    console.log(videoRef)

    playVideoFromCamera().then(data => {
      console.log(videoRef)
      videoRef.current.srcObject =data;
   })
  }

  return (
    <div className="flex flex-col">
      <NavBar />
      <div className='flex flex-row'>
        <div className='justifiy-self-auto mx-3 '>
          <UserList className="p-3 text-left" />
          <button className="bg-red-500 w-full text-white">Exit</button>
        </div>
        {/* <Video ></Video> */}
        <video ref={videoRef} autoPlay playsInline></video>
        <button onClick={handleVideo}>get video</button>

      </div>
      </div>
      



  )
}

