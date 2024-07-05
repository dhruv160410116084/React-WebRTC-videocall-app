import { useEffect, useState } from 'react'
import User from './User'
import { io } from 'socket.io-client';
import { SERVER_URL, socket } from '../socket';
// import { socket } from '../socket';
import {SyncLoader} from 'react-spinners'

function UserList(props) {

    
    const [tab, setTab] = useState(1)
    const [allUsers, setAllUsersList] = useState([])
    const [isLoading,setIsLoading] = useState(false)

    useEffect(() => {
        // console.log(props.socket.connected)
        props.socket.emit('get-users');
        setIsLoading(true)
        props.socket.on('users', function (data) {

            // console.log(data)
            data = Object.keys(data).map(key => {
                return { socketId: key, ...data[key].data }

            }).filter(v => v.socketId !== socket.id)
            // console.log(data,' refined data')
            props.setUserList(data)
        setIsLoading(false)

        })
    }, [  ])

    function handleOnClick(e) {
        // console.log(e)
        if (e.target.id == '1') {
            setTab(1)
        } else if (e.target.id == '2') {
            setTab(2)
            setIsLoading(true)

            fetch('http://'+window.location.host+':3000/api/user?'+ new URLSearchParams({
                skip:0,
                limit:10
            }),{
                method:'GET',
                
            }).then(async data => {
                data = await data.json();
                data = data.map(d => {
                    // console.log(d)
                 return {   ...d,userName:d.username}
                })
                // console.log(data)

                setAllUsersList(data)
        setIsLoading(false)

            })

        }
        // console.log(tab)
    }

    return (
        <div id='user-list' className={props.className + ' border-x-blue-200 '}>
            {/* <h2 className=' text-2xl text-center '>  <b>Users</b> </h2> */}
            <div className='flex flex-row justify-center bg-indigo-500'>
                <div
                    onClick={handleOnClick}
                    name='1'
                    id='1'
                    className={'text-white text-center hover:cursor-pointer hover:bg-slate-400  p-2.5 mx-0 w-full ' + (tab == '1' ? 'bg-slate-400' : '')}>
                    Online
                </div>
                <div onClick={handleOnClick}
                    name='2'
                    id='2'
                    className={'text-white text-center hover:cursor-pointer hover:bg-slate-400 p-2.5 mx-0 w-full '  + (tab == '2' ? 'bg-slate-400' : '')}>
                    All Users</div>
            </div>

           {isLoading && <SyncLoader color='#06b6d8' size={10} className='text-center my-4'/>} 
            {tab == 1 &&
                
                (props.userList.length > 0 ? props.userList.map(u => {
                    // console.log(u)
                    return <div className='' key={u.socketId}>
                        <User data={u} makeCall={props.makeCall} tab={tab} />
                        <hr className='border-black'/>

                    </div>

                }) : <h2 className='text-center my-2 text-xl'>No Online users</h2>)
            }
            {
                tab == 2 && (allUsers.length > 0 ? allUsers.map(u => {
                    return <div className='' key={u.socketId}>
                        
                        <User data={u} makeCall={props.makeCall} />
                        <hr className='border-black'/>


                    </div>

                }) : <h2 className='text-center my-2 text-xl'>No Users</h2>)
            }
        </div>
    )
}

export default UserList