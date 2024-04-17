import NavBar from "../NavBar/NavBar";
import UserList from "../Users/UserList";
import Video from "../Video/Video";

export default function Lobby() {
  return (
    <div className="flex flex-col">
      <NavBar />

    
      <div className='flex flex-row'>
        <div className='justifiy-self-auto mx-3 '>
          <UserList className="p-3 text-left" />
          <button className="bg-red-500 w-full text-white">Exit</button>
        </div>

        {/* <div className='w-4/6'> */}
        <Video className='grow' ></Video>
        {/* <br />
      <Video></Video> */}
        {/* </div> */}

      </div>
      </div>
      



  )
}