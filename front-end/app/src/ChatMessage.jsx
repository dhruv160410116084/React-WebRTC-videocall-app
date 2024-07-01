import { useEffect, useState } from "react";
import { socket } from "./socket";
import FileIcon from './assets/document.svg'
import { BarLoader } from "react-spinners";

export default function ChatMessage(props) {
  // console.log(props.chatList)
 
  function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

  return (
    <ul className="flex flex-col  m-2 max-h-screen ">
      {props.chatList.length > 0 && props.chatList.map((m, i) => {
        m.time = new Date(m.time)
        return ( <div key={i} style={{ maxWidth: '80%' }} className={`${socket.id == m.user.socketId ? 'self-end ' : 'self-start '}`}>
          {socket.id !== m.user.socketId && <h2 className="text-start text-sm font-semibold -my-1">{m.user.userName}</h2>}
          <li className={`px-2 py-1 my-1 break-words ${socket.id == m.user.socketId ? ' bg-slate-600 rounded text-white' : ' bg-indigo-600 rounded text-white'}`}>
            {m.type=== 'file-metadata'?
            <div className="flex flex-row"> <img className="mx-1" height={22} width={22} src={FileIcon} alt="File" />
            <div>
            {m.fileName}    
            {/* <BarLoader color="#06b6d8" />   */}
            {/* <div className="text-xs font-bold text-gray-300 text-left">{percentage}%</div> */}
            <h6 className="text-xs text-gray-300 text-right">{formatBytes( m.fileSize)}</h6>
            </div>
          
             </div> 
             :m.message}
            </li>
          <div className="text-end text-xs">{m.time.getHours() + ":"+ m.time.getMinutes()}</div>
        </div>)
      })}
    </ul>
  );
}
