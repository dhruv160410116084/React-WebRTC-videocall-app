import meetingLogo from '../assets/call.svg'


export default function User(props) {
    // console.log(props)

    function handleOnClick(data) {
        // console.log(props.data.socketId)
        props.makeCall(props.data.socketId)
    }
    return (
        <div key={props.data.socketId}
            className='flex flex-row p-2 px-4 justify-between hover:bg-slate-400 hover:cursor-pointer hover:text-white'
           >
                <img src={props.data.profile} className='h-10'></img>
            <h2 className="p-1 text-xl" id={props.data.socketId}>{props.data.userName}</h2>
            {props.tab === 1 &&  <img src={meetingLogo} className=''  onClick={handleOnClick} ></img> }
        </div>

    )
}