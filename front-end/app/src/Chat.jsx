import React, { useEffect, useRef, useState } from 'react';
import AttachmentIcon from './assets/clip.svg';
import PapperPlanIcon from './assets/paper-plane.svg';
import ChatMessage from './ChatMessage';
import { socket } from './socket';
import { useLocation } from 'react-router-dom';

export function Chat(props) {
  const [message, setMessage] = useState("");
  const location = useLocation();
  let fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  console.log(props);

  let fileReader = new FileReader();
  let offset = 0
  const MAX_BUFFERED_AMOUNT = 16 * 16 * 1024;

//   useEffect(() => {
// console.log('reloaded by data channel props');
//   }, [props.dc,props.isOnCall])

  function handleSubmit(e) {
    e.preventDefault();
    console.log(message, props, location.state);
    if (file) {
      let chunkSize = 16 * 1024
      fileReader.addEventListener('error', err => console.error(error))
      fileReader.addEventListener('abort', err => console.error(error))

      fileReader.addEventListener('load', e => {
        console.log('file loaded', e)
        props.dc.send(e.target.result)
        props.dc.onbufferedamountlow = () => {
          console.log('res start sending afer buffer empty')
          if (file && offset < file.size) {
            readSlice(offset);
          }
        }
        offset += e.target.result.byteLength;


        // sendProgress.value = offset;
        if (offset < file.size) {
          if (props.dc.bufferedAmount < MAX_BUFFERED_AMOUNT) {
            readSlice(offset);

          }

        }

      })
      const readSlice = o => {
        console.log('readSlice ', o);
        const slice = file.slice(offset, o + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };
      readSlice(0)


    } else {
      let msgData = {
        message: message,
        time: new Date(),
        user: { socketId: socket.id, userName: location.state.userName, profile: location.state.profile },
      };

      if (props.dc && props.dc.readyState === 'open') {
        props.dc.send(JSON.stringify(msgData));
      }

      props.setChatList((prevChatList) => [...prevChatList, msgData]);
    }

    setMessage("");
    setFile(null)
  }

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  function handleFileInput(e) {
    e.preventDefault()
    fileInputRef.current.click()
  }

  function handleFileChange(e) {
    console.log(e.target.files)
    setFile(e.target.files[0])
    setMessage(e.target.files[0].name)
    let msgData = {
      message: message,
      type: 'file-metadata',

      name: e.target.files[0].name,
      size: e.target.files[0].size,
      socketId: socket.id,

      user: { socketId: socket.id, userName: location.state.userName, profile: location.state.profile },
    };
    console.log(msgData)
    if (props.dc) {
      props.dc.send(JSON.stringify(msgData))
      props.setChatList((prevChatList) => [...prevChatList, {
        message: message,
        type: 'file-metadata',
  
        fileName: e.target.files[0].name,
        fileSize: e.target.files[0].size,
        socketId: socket.id,
        time:new Date(),
        user: { socketId: socket.id, userName: location.state.userName, profile: location.state.profile },
      }])

    }
  }

  useEffect(() => {

  }, [props.dc])

  return (
    <div className="border-x-blue-200 w-1/5 flex flex-col justify-end" >

      <ChatMessage chatList={props.chatList} />
      <form className='bg-white flex flex-row justify-between' onSubmit={handleSubmit}>
        <button type='button' className='bg-cyan-600 rounded-none' onClick={handleFileInput}>
          <img src={AttachmentIcon} alt="" height={22} width={22} />
        </button>
        <input type="file" name='file' hidden ref={fileInputRef} onChange={handleFileChange} />
        <input type='text' name="message" className='px-1 w-full focus:outline-none text-black bg-white' placeholder="Type a message" value={message} onChange={handleMessage} />
        <button type='submit' className='bg-cyan-600 rounded-none'>
          <img src={PapperPlanIcon} alt="" height={22} width={22} />
        </button>
      </form>
    </div>
  );
}
