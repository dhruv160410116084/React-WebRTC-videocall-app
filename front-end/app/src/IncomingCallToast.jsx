import callGif from './assets/system-solid-58-call-phone.gif'
import callAccept from './assets/circle-phone-green.svg'
import callDeny from './assets/circle-phone-red.svg'
import incomingCallTone from './assets/google_meet.mp3'
import { socket } from './socket';


export default function IncomingCallToast(props){
    // console.log(props);
    function handleAcceptCall(e){
        // console.log(e)
        props.toastProps.closeToast();
        props.makeWebRTCCall(props.userId)
        socket.emit('call-accept',{id:props.userId})
    }

    function handleDenyCall(e){
        // console.log(e)
        socket.emit('deny-call',{id:props.userId})
        props.toastProps.closeToast();


    }

    return(
        <div className='flex flex-row justify-around items-center'>
            <img src={callGif} alt="" height={32} width={32} />
            <h2> <b>Call from {props.userName} </b></h2>
            <img src={callAccept} className='hover:cursor-pointer' alt="" height={32} width={32} onClick={handleAcceptCall} />
            <img src={callDeny} alt="" height={32} width={32} className='mx-0.5 hover:cursor-pointer' onClick={handleDenyCall} />
            <audio src={incomingCallTone} autoPlay loop></audio>
        </div>
    )

}