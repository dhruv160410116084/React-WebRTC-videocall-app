import meetingLogo from '../assets/call.svg'


export default function User(props) {
    // console.log(props)

    function handleOnClick(data) {
        // console.log(props.data.socketId)
        props.makeCall(props.data.socketId)
    }
    return (
        <div key={props.data.socketId}
            className={`flex flex-row p-2 px-4 hover:bg-slate-400  hover:text-white justify-between`  }
           >
            <div className='flex flex-row'>
            <img src={props.data.profile} className='h-10'></img>
            <h2 className="p-1 text-xl mx-0.5" id={props.data.socketId}>{props.data.userName}</h2>
            </div>
                
            {props.tab === 1 &&  <img src={meetingLogo} className='hover:cursor-pointer'  onClick={handleOnClick} ></img> }
        </div>

    )
}