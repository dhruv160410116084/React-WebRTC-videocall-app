import { useState } from 'react';
import meetingLogo from '../assets/online-meeting.png'
import { useNavigate } from 'react-router-dom'



export default function Login() {

    let navigator = useNavigate();
    let [userName, setUserName] = useState('')



    function submitUser(formData) {
        const query = formData.get('username')
        alert(query)
        console.log(query)
    }


    return (
        <form className="flex flex-col justify-evenly">

        
                {/* <div className='flex flex-row'> */}
                <h1 className="flex-1 m-2">Hop In</h1>
                {/* <img src={meetingLogo} alt="" width={50} height={20} />     */}
                {/* </div> */}

                <input type="text" name='username' className="border-2 border-black flex-1 m-2 p-2" placeholder="Enter your username"  />
                <button type='submit' className="bg-indigo-500 text-white m-2" > Enter</button>
            
        </form>


    )
}