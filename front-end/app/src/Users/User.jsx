import meetingLogo from '../assets/call.svg'


export default function User(props){
    // console.log(props)

    function handleOnClick(data){
        // console.log(props.data.socketId)
        props.makeCall(props.data.socketId)
    }
    return (
        <div key={props.data.socketId} className='flex flex-row p-2 px-4 justify-between hover:bg-slate-500 hover:cursor-pointer' onClick={handleOnClick}>
           <h3 className="p-1 " id={props.data.socketId}>{props.data.userName}</h3>
        <img src={meetingLogo} className='' ></img>
        </div>
        
    )
}