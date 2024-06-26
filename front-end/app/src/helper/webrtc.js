 export async function playVideoFromCamera(deviceId,isMicOn){
    try {
        const list = await navigator.mediaDevices.enumerateDevices();
        // console.log(list)
        const stream = await navigator.mediaDevices.getUserMedia({video:{deviceId},audio:true})
        // console.log(stream)
        if(!isMicOn){
            stream.getAudioTracks().forEach(t => t.enabled=false)
        }
        return stream
    } catch (error) {
        console.error('Error opening video camera.',error)
    }
}

export async function listMedia(){
    try {
        const list = await navigator.mediaDevices.enumerateDevices();
        return list
    } catch (error) {
        console.log(error)
    }
}