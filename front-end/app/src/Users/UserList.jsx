import { useEffect, useState } from 'react'
import User from './User'
import { io } from 'socket.io-client';
import { socket } from '../socket';
// import { socket } from '../socket';
// let user = ["Dhruv","Dvarc","Deathstar","R2D2","AP", "Jheel"]


async function setRemoteDescription(){

}

function UserList(props){

    const [userList,setUserList] = useState([]);

    useEffect(()=>{
        console.log(props.socket.connected)
        props.socket.emit('get-users');
        props.socket.on('users',function (data){
            console.log("users from server -------------------")
            console.log(data)
          data=  Object.keys(data).map(key =>  {
              return   {socketId:key, userName:data[key]}
            
            }).filter(v => v.socketId !== socket.id)
            console.log(data)
            setUserList(data)
        })
    },[])
    function handleOnClick(){
        console.log("hello")
    }

    return (
        <div id='user-list' className={props.className + ' border-x-blue-200'}>
         <h2 className=' text-2xl text-center'>  <b>Users</b> </h2>  

            {
                userList.map(u => {
                    return  <div className=''>
                    <User data={u} makeCall={props.makeCall} />
                    
                    
                    </div>
                    
                })
            }
        </div>
    )
}

export default UserList