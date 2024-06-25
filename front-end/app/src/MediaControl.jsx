import { useEffect, useRef, useState } from 'react';
import CameraOnIcon from './assets/camera-security.svg';
import CameraOffIcon from './assets/webcam-slash.svg';
import CallEndIcon from './assets/call-end.svg';
import MicrophoneOnIcon from './assets/microphone.svg';
import MicrophoneOffIcon from './assets/microphone-slash.svg';
import { listMedia, playVideoFromCamera } from './helper/webrtc';

export default function MediaControl({ cleanup, localStream, handleVideo, pc, className, remotePc, videoElemRef, isCamOn, setIsCamOn, isMicOn, setIsMicOn,isOnCall }) {
  const CameraIconRef = useRef(null);
  const MicrophoneIconRef = useRef(null);
  
  const [videoInputList, setVideoInputList] = useState([]);
  const [camera,setCamera] = useState(null)

  useEffect(() => {
    listMedia().then(list => {
      list = list.filter(e => e.kind === 'videoinput')
      setVideoInputList(list);
      // console.log(list[0])
      // console.log('localstream: ',localStream)
      if(localStream){
        setCamera(list.find((e) => {
          return e.deviceId === localStream.getVideoTracks()[0].getCapabilities().deviceId
        }))
      }


    });
    // console.log(localStream)
  }, [localStream,isCamOn,isMicOn]);

  useEffect(() => {
    // console.log('PeerConnection or localStream changed', pc, localStream);
  }, [pc]);

  const handleCamera = async () => {
    try {
      // debugger
      console.log('handle camera',isCamOn)
      const videoTracks = localStream?.getVideoTracks();
      if (!isCamOn) {
        // Turning the camera on
        await handleVideo();
        CameraIconRef.current.src = CameraOnIcon;

        if (localStream && pc) {
          console.log('tracks added')  
          // localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
          // if(pc){
          // [pc,remotePc].forEach(p => {
          //   const sender = p.getSenders().find(s => s.track.kind === videoTracks.kind)
          //   console.log(sender)
          //   sender.replaceTrack(videoTracks)
          // })
            
          // }
          videoTracks.forEach(track => {
            track.enabled = true;
            // if (pc) {
            //   const sender = pc.getSenders().find(s => s.track === track);
            //   if (sender) {
            //     pc.addTrack(sender);
            //     console.log('track added')
            //   }
            // }
          });
        }
      } else {
        // Turning the camera off
        // console.log('in camera off code',setIsCamOn,videoTracks)
        CameraIconRef.current.src = CameraOffIcon;
        // videoElemRef.current.src = ""
        // videoElemRef.current.currentTime=0;

        videoTracks.forEach(track => {
          // console.log('in if tracks')
          track.enabled = false;
          // if (pc) {
          //   const sender = pc.getSenders().find(s => s.track === track);
          //   if (sender) {
          //     console.log('track removed')
          //     pc.removeTrack(sender);
          //   }
          // }
        });
      }
      setIsCamOn(!isCamOn);
    } catch (error) {
      console.error('Error toggling camera', error);
    }
  };

  const handleMicrophone = () => {
    MicrophoneIconRef.current.src = isMicOn ? MicrophoneOffIcon : MicrophoneOnIcon;
    const audioTracks = localStream?.getAudioTracks();
    console.log(audioTracks)
    audioTracks.forEach(track => {
      track.enabled = !isMicOn;
    });

   
    setIsMicOn(!isMicOn);
  };

  const handleCameraStreamChange = async (e) =>{
    console.log(e.target.value)
    setCamera(e.target.value)
  //  let stream = await playVideoFromCamera(e.target.value)
   await handleVideo(e.target.value,isMicOn)
  }

  const handleCallEnd = () => {
    console.log('call end');
    cleanup();
  };

  return (
    <div className={`m-3 p-3 bg-slate-300 w-fit rounded-lg flex flex-row ${className}`}>
      <button className='bg-gray-400 hover:bg-cyan-400 mx-1' onClick={handleCamera}>
        <img className='h-5' src={CameraOnIcon} ref={CameraIconRef} alt="Camera Toggle" />
      </button>
      <select name="camera" id="camera-list" value={camera?.deviceId}  onChange={handleCameraStreamChange}>
        {videoInputList.map(v => (
          <option key={v.deviceId} className='p-3 m-3 h-8' value={v.deviceId}>
            {v.label}
          </option>
        ))}
      </select>
      <button className='bg-gray-400 hover:bg-cyan-400 mx-1' onClick={handleMicrophone}>
        <img className='h-5' src={MicrophoneOnIcon} alt="Microphone Toggle" ref={MicrophoneIconRef} />
      </button>
      {
        isOnCall && <img src={CallEndIcon} className="h-10 hover:cursor-pointer" alt="End Call" onClick={handleCallEnd} />
      }
      
    </div>
  );
}
