 export async function playVideoFromCamera(camera){
    try {
        const stream = await navigator.mediaDevices.getUserMedia({video:true})
        // console.log(stream)
        return stream
    } catch (error) {
        console.error('Error opening video camera.',error)
    }
}