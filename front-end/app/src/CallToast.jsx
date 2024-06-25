import callGif from './assets/system-solid-58-call-phone.gif'
import callAccept from './assets/circle-phone-green.svg'
import callDeny from './assets/circle-phone-red.svg'
import incomingCallTone from './assets/google_meet.mp3'
import { socket } from './socket'


export default function CallToast(props){
    function handleDenyCall(){
        socket.emit('cancel-call',{id:props.id})
        props.toastProps.closeToast();
    }

    return(
        <div className='flex flex-row justify-around items-center'>
            <img src={callGif} alt="" height={32} width={32} />
            <h2> <b>Calling {props.userName} </b></h2>
            {/* <img src={callAccept} alt="" height={32} width={32}  /> */}
            <img src={callDeny} alt="" height={32} width={32} className='mx-0.5 hover:cursor-pointer' onClick={handleDenyCall} />
            {/* <audio src={incomingCallTone} autoPlay loop></audio> */}
        </div>
    )

}