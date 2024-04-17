import { useState } from 'react'
import User from './User'

let user = ["Dhruv","Dvarc","Deathstar","R2D2","AP", "Jheel bhindu"]

function UserList(props){


    return (
        <div id='user-list' className={props.className + ' border-x-blue-200'}>
         <h2 className=' text-2xl'>  <b>Users</b> </h2>  

            {
                user.map(u => {
                    return <User data={u}/>
                })
            }
        </div>
    )
}

export default UserList