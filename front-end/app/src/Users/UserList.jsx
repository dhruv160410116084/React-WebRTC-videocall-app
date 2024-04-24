import { useState } from 'react'
import User from './User'
import meetingLogo from '../assets/call.svg'
let user = ["Dhruv","Dvarc","Deathstar","R2D2","AP", "Jheel"]

function UserList(props){
    function handleOnClick(){
        console.log("hello")
    }

    return (
        <div id='user-list' className={props.className + ' border-x-blue-200'}>
         <h2 className=' text-2xl text-center'>  <b>Users</b> </h2>  

            {
                user.map(u => {
                    return  <div className='flex flex-row p-2 px-4 justify-between hover:bg-slate-500 '>
                    <User data={u} />
                    <img src={meetingLogo} onClick={handleOnClick} className='hover:cursor-pointer'></img>
                    
                    </div>
                    
                })
            }
        </div>
    )
}

export default UserList