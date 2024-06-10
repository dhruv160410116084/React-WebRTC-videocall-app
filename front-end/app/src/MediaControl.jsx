import { useEffect, useRef, useState } from 'react'
import CameraOnIcon from './assets/camera-security.svg'
import CameraOffIcon from './assets/webcam-slash.svg'

import MicrophoneOnIcon from './assets/microphone.svg'
import MicrophoneOffIcon from './assets/microphone-slash.svg';
import { listMedia } from './helper/webrtc';

export default function MediaControl(props) {

    const CameraIconRef = useRef(null);
    const MicrophoneIconRef = useRef(null);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn,setIsMicOn] = useState(true);
    const [videoInputList,setVideoInputList] = useState([])
    // const audioInputList = []



    useEffect(()=>{
    listMedia().then(list => {
        console.log(list)

        setVideoInputList(list.filter(e => e.kind == 'videoinput'))
        console.log(videoInputList)
        
    })
    },[])

    function handleCamera() {
     
        CameraIconRef.current.src = !isCamOn ? CameraOnIcon : CameraOffIcon
        setIsCamOn(p => !p)
 
    }

    function handleMicrophone() {
        MicrophoneIconRef.current.src = !isMicOn ? MicrophoneOnIcon : MicrophoneOffIcon
        setIsMicOn(p => !p)
    }

    return (
        <div className='m-3 p-3 bg-slate-300 w-fit rounded-lg' {...props.className} >
            <button className='bg-gray-400 hover:bg-cyan-400 mx-1' onClick={handleCamera}>
                <img className='h-5' src={CameraOnIcon} ref={CameraIconRef} alt="" /></button>
            <select name="camera" id="camera-list">
                {
                    videoInputList.map(v => <option key={v.deviceId} className='p-3 m-3 h-8' value={v.deviceId}>{v.label} </option>)
                }

            </select>
            <button className='bg-gray-400 hover:bg-cyan-400 mx-1' onClick={handleMicrophone}>
                <img className='h-5' src={MicrophoneOnIcon} alt="" ref={MicrophoneIconRef} /></button>
            {/* <select name="microphone" id="microphone-list">
                <option value="Int cam">Int Cam</option>
                <option value="cam">Cam</option>

            </select> */}
        </div>


    )
}