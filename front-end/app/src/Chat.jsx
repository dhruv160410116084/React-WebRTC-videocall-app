import React, { useEffect, useState } from 'react'
import AttachmentIcon from './assets/clip.svg'
import PapperPlanIcon from './assets/paper-plane.svg'
import ChatMessage from './ChatMessage';
import { socket } from './socket';
import { useLocation } from 'react-router-dom';





export function Chat(props) {

    const [message, setMessage] = useState(null);
    const location = useLocation();
    console.log(props)
    function handleSubmit(e) {
        e.preventDefault();

        console.log(message, props,location.state)
        let msgData = {message:message,user:{socketId:socket.id,userName:location.state.userName,profile:location.state.profile }}
        props.dc.send(JSON.stringify( msgData))
        props.setChatList([...chatList,msgData])
    }

    function handleMessage(e) {
        setMessage(e.target.value)
    }

    useEffect(()=>{

    },[props.dc,props.chatList])

    return (
        <React.Fragment>
            <div className='justify-self-start'>
                <h2 className="text-2xl">Upcoming Features</h2>
                <ul className="text-left mx-6" style={{ listStyle: 'outside' }}>
                    <li>Realtime Chat (done)</li>
                    <li>Peer-to-Peer file transfer</li>
                    <li>Group Video Calls</li>
                </ul>
            </div>

            <ChatMessage setChatList={props.setChatList} chatList={props.chatList}/>
            <form className='bg-white flex flex-row justify-between' onSubmit={handleSubmit}>

                <button className='bg-white'>
                    <img src={AttachmentIcon} alt="" height={22} width={22} />

                </button>
                <input type='text' name="message" className='w-full' onChange={handleMessage} />

                <button type='submit' >
                    <img src={PapperPlanIcon} alt="" height={22} width={22} />
                </button>

            </form>
        </React.Fragment>

    )
}

