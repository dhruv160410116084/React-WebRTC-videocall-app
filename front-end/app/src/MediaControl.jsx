import CameraOnIcon from './assets/camera-security.svg'
import MicrophoneIcon from './assets/microphone.svg'

export default function MediaControl(props){

    function handleCamera(){

    }

    function handleMicrophone(){

    }

    return (
        <div className='m-3 p-3'>
        <button className='bg-gray-400 hover:bg-cyan-400 mx-1'><img className='h-5' src={CameraOnIcon} alt="" /></button>
        <select name="camera" id="camera-list">
            <option value="Int cam">Int Cam</option>
            <option value="cam">Cam</option>

        </select>    
        <button className='bg-gray-400 hover:bg-cyan-400 mx-1'><img className='h-5' src={MicrophoneIcon} alt="" /></button>    
        <select name="microphone" id="microphone-list">
            <option value="Int cam">Int Cam</option>
            <option value="cam">Cam</option>

        </select>   
        </div>
        

    )
}