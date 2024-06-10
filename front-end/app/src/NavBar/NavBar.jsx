import { useLocation } from 'react-router-dom'
import meetingLogo from '../assets/online-meeting.png'


export default function NavBar(props){
 

    return (
        <nav className="flex flex-row justify-between items-center bg-cyan-500 w-full h-12 p-3">
        <div className="flex items-center">
            <div className="font-bold text-white text-2xl m-2">CharCha</div>
            <img src={meetingLogo} alt="" width='30px' height='30px' />
        </div>
        <div className='ml-auto place-self-end text-red-200 font-bold'>{props.userName}
        
        </div>
        <button className="bg-red-500 text-white m-1 py-1">Exit</button>
       

    </nav>
    
    )
}