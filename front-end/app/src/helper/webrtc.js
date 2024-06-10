 export async function playVideoFromCamera(camera){
    try {
        const list = await navigator.mediaDevices.enumerateDevices();
        console.log(list)
        const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:false})
        // console.log(stream)
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