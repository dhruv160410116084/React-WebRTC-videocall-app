import {playVideoFromCamera} from '../helper/webrtc'
import { useState } from 'react';


 function Video(props){
    // let stream = null;
    const [stream,setStream] = useState(null)

    playVideoFromCamera().then(stream => setStream(stream))
    
    return(
        <video  controls className={props.className} src={stream}>

        </video>
        
    )
}

function getOwnStream(){

}

// playVideoFromCamera()

export default Video