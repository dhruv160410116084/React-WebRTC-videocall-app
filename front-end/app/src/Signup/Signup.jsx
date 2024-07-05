import { useState } from 'react';
import meetingLogo from '../assets/online-meeting.png'
import { useNavigate } from 'react-router-dom'
import { playVideoFromCamera } from '../helper/webrtc';
import TeaIcon from '../assets/teaIcon.gif'
import { SERVER_URL } from '../socket';
import { ToastContainer, toast } from 'react-toastify';



export default function Signup(props) {

    let navigator = useNavigate();
    let [userName, setUserName] = useState('')
    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    let [cpassword, setcPassword] = useState('')
    let [submit,setSubmit] = useState(true)




    async function submitUser(e) {
        // const query = formData.get('username')
        // alert(query)
        e.preventDefault()
        console.log(userName,email,password)
        // playVideoFromCamera().then(data => {
        //     // stream = data;
        //     // setStream(data)
        //     console.log("in use effect")
        // navigator("/lobby", {
        //     state: { userName: userName }
        // })

        //  })
        let data = await fetch('http://'+window.location.host+':3000/api/user',{
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify( {
                'password':password,
                'email':email,
                'username':userName
            })
        })

        data = await data.json();

        console.log(data)
        
        if(data.success){
            navigator('/')
        }else{
            if(data.data)
                toast(data.data)
            else 
                toast(data.message)
        }
    }

    function handleUserName(e){
        if(e.target.name === 'username'){
            setUserName(e.target.value)
        }else if(e.target.name === 'password'){
            setPassword(e.target.value)
        }else if(e.target.name === 'email'){
            setEmail(e.target.value)
        }else if(e.target.name === 'confirm-password'){
            setcPassword(e.target.value)
            if(password==e.target.value){
                setSubmit(false)
            }else{
                setSubmit(true)

            }
        }
    }


    return (
        <div className="flex flex-col justify-center items-center min-h-screen">

            <form className="flex flex-col w-1/3 border p-6 rounded-lg shadow-lg  bg-white">
                <div className='flex flex-row justify-center'>
                    <h1 className='m-2'>CharCha</h1> <img src={TeaIcon} alt="" className='h-16' />

                </div>
                <h1 className="m-2 text-xl font-bold">Sign up</h1>
                <input
                    type="text"
                    name="username"
                    className="border-2 border-black m-2 p-2"
                    placeholder="Enter your username"
                    value={userName}
                    onChange={handleUserName}
                />
                <input
                    type="email"
                    name="email"
                    className="border-2 border-black m-2 p-2"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleUserName}
                />
                <input
                    type="password"
                    name="password"
                    className="border-2 border-black m-2 p-2"
                    placeholder="Enter your password"
                    value={password}
                    maxLength={8}
                    onChange={handleUserName}
                />

                <input
                    type="password"
                    name="confirm-password"
                    className="border-2 border-black m-2 p-2"
                    placeholder="Confirm password"
                    value={cpassword}
                    maxLength={8}

                    onChange={handleUserName}
                />
                <button
                    className="bg-indigo-500 text-white m-2 p-2 rounded hover:bg-indigo-700 disabled:bg-slate-400"
                    onClick={submitUser}
                    disabled={submit}
                >
                    Submit
                </button>
            </form>
            <div className="mt-4">
                Already a user? <a href="/login" className="text-indigo-500 hover:underline">Hop In</a>
            </div>
            <ToastContainer />

        </div>



    )
}