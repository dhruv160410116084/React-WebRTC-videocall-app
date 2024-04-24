import { useState } from 'react';
import meetingLogo from '../assets/online-meeting.png'
import { useNavigate } from 'react-router-dom'
import { playVideoFromCamera } from '../helper/webrtc';



export default function Login() {

    let navigator = useNavigate();
    let [userName, setUserName] = useState('')



    function submitUser(e) {
        // const query = formData.get('username')
        // alert(query)
        e.preventDefault()
        console.log(userName)
        // playVideoFromCamera().then(data => {
        //     // stream = data;
        //     // setStream(data)
        //     console.log("in use effect")
        navigator("/lobby",{
            state:{userName:userName}
        })

        //  })
    }

    function handleUserName(e){
        
        setUserName(e.target.value)
    }


    return (
        <form className="flex flex-col justify-evenly">

        
                {/* <div className='flex flex-row'> */}
                <h1 className="flex-1 m-2">Hop In</h1>
                {/* <img src={meetingLogo} alt="" width={50} height={20} />     */}
                {/* </div> */}

                <input type="text" name='username' className="border-2 border-black flex-1 m-2 p-2" placeholder="Enter your username" value={userName} onChange={handleUserName} />
                <button className="bg-indigo-500 text-white m-2" onClick={submitUser}> Enter</button>
            
        </form>


    )
}