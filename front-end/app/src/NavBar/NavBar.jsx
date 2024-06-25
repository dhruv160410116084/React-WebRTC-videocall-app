import TeaIcon from '../assets/teaIcon.gif'
import ExitIcon from '../assets/power.svg'
import {  useNavigate } from 'react-router-dom';


export default function NavBar(props) {
    let navigator = useNavigate();

    function handleExit(){
        navigator('/login',{replace:true})
    }

  return (
    <nav className="flex flex-row justify-between  bg-cyan-500 w-full h-12">
      <div className="flex  bg-white">
        <div className="font-bold   text-2xl  flex px-2">
          <span className='text-cyan-500 self-center'>CharCha</span>
          <img src={TeaIcon} className='' alt="Tea Icon" width='40px' height='40px' />
        </div>
      </div>
      <div className='ml-auto place-self-end self-center text-white  font-bold mx-2'>
        <img src={props.profile} alt={props.userName} className='hover:cursor-pointer' height={40} width={40} />
      </div>
      <img src={ExitIcon} alt="" height={30} width={30} className='mx-0.5 hover:cursor-pointer' onClick={handleExit}/>
    </nav>
  );
}
