import { useEffect, useState } from "react"

export default function ChatMessage(props) {
   console.log(props)



    return (
        <ul className="flex flex-col m-2">
            {
                props.chatList.length > 0 && props.chatList.map((m, i) =>
                    <div  key={i} style={{ maxWidth: '80%' }} className={`${i % 2 == 0 ? 'self-end ' : 'self-start '}`}>
                        {i%2 != 0 && <h2 className="text-start text-sm font-semibold -my-1">Dhruv</h2>}
                        <li className={`px-2 py-1 my-1    ${i % 2 == 0 ? 'text-right  bg-slate-600 rounded text-white' : 'text-left  bg-indigo-600 rounded text-white'}`}>{m.message} </li>
                        <div className="text-end text-xs" >3.00</div>
                    </div>

                )
            }
        </ul>
    )
}