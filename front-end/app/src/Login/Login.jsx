import { useEffect, useState } from 'react';
import meetingLogo from '../assets/online-meeting.png'
import { useNavigate } from 'react-router-dom'
import { playVideoFromCamera } from '../helper/webrtc';
import TeaIcon from '../assets/teaIcon.gif'
import { SERVER_URL } from '../socket';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Login() {

    let navigator = useNavigate();
    let [userName, setUserName] = useState('')
    let [password,setPassword] = useState('')
    let [email,setEmail]=useState('')


    async function submitUser(e) {
        // const query = formData.get('username')
        // alert(query)
        e.preventDefault()
        console.log(userName,password,email)
        let data = await fetch('/api/user/login',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify( {
                password,
                email,
            })
        })

        data = await data.json();
        console.log(data)    
            // playVideoFromCamera().then(data => {
        //     // stream = data;
        //     // setStream(data)
        //     console.log("in use effect")
        if(data.success){
            navigator("/lobby",{
                state:{
                    userName:data.data.username,
                    email: data.data.email,
                    profile: data.data.profile
                }
            })
        }else{
            toast(data.message)
        }
    

        //  })
    }

    useEffect(()=>{
        
    },[])

    function handleUserName(e){
        if(e.target.name === 'username'){
            setUserName(e.target.value)
        }else if(e.target.name === 'password'){
            setPassword(e.target.value)
        }else if(e.target.name === 'email'){
            setEmail(e.target.value)
        }
    }

    return (
        <div>
            <form className="flex flex-col justify-evenly p-8  rounded-lg shadow-2xl bg-white">

                    
            {/* <div className='flex flex-row'> */}
            {/* <h1 className="flex-1 m-2">Hop In</h1> */}
            <div className='flex flex-row'>
            <h1 className='m-2 text-black'>CharCha</h1> <img src={TeaIcon} alt="" className='h-16'/>

            </div>
        <h1 className="m-2 text-xl text-black font-bold">Hop In</h1>

            {/* <img src={meetingLogo} alt="" width={50} height={20} />     */}
            {/* </div> */}

            {/* <input type="text"
             name='username' 
             className="border-2 border-black flex-1 m-2 p-2" 
             placeholder="Enter your username" 
             value={userName} 
             onChange={handleUserName} /> */}
             
            <input 
            type="text" 
            name="email" 
            className="border-2 border-black m-2 p-2" 
            placeholder="Enter your email" 
            value={email} 
            onChange={handleUserName} />

            <input 
            type="password" 
            name="password" 
            className="border-2 border-black m-2 p-2" 
            placeholder="Enter your password" 
            value={password} 
            maxLength={8}
            onChange={handleUserName} />

            <button className="bg-indigo-500 text-white m-2" onClick={submitUser}> Enter</button>

            </form>
            <div className="mt-4">
            New User? <a href="/signup">Sign Up</a>
            </div>
            <ToastContainer />
        </div>
        


    )
}