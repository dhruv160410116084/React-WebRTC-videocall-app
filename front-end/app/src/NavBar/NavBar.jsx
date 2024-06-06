import { useLocation } from 'react-router-dom'
import meetingLogo from '../assets/online-meeting.png'


export default function NavBar(props){
 

    return (
        <nav className="flex flex-row float-start bg-cyan-500 w-full h-12 items-center p-3">
             <div className="font-bold text-white text-2xl m-2">CharCha</div>
             <img src={meetingLogo} alt="" width='30px' height='30px' />
             <div>{props.userName}</div>
        </nav>
    )
}