import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function ChatMessage(props) {
  return (
    <ul className="flex flex-col m-2">
      {props.chatList.length > 0 && props.chatList.map((m, i) => {
        m.time = new Date(m.time)
        return ( <div key={i} style={{ maxWidth: '80%' }} className={`${socket.id == m.user.socketId ? 'self-end ' : 'self-start '}`}>
          {socket.id !== m.user.socketId && <h2 className="text-start text-sm font-semibold -my-1">{m.user.userName}</h2>}
          <li className={`px-2 py-1 my-1 ${socket.id == m.user.socketId ? 'text-right bg-slate-600 rounded text-white' : 'text-left bg-indigo-600 rounded text-white'}`}>{m.message}</li>
          <div className="text-end text-xs">{m.time.getHours() + ":"+ m.time.getMinutes()}</div>
        </div>)
      })}
    </ul>
  );
}
