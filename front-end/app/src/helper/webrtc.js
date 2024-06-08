 export async function playVideoFromCamera(camera){
    try {
        const list = await navigator.mediaDevices.enumerateDevices();
        console.log(list)
        const stream = await navigator.mediaDevices.getUserMedia({video:{deviceId:'1fa0d17d736afa8f45fc8d2bcb47f0dd5da42d73959edb70f058e061ff7b8d4b'}})
        // console.log(stream)
        return stream
    } catch (error) {
        console.error('Error opening video camera.',error)
    }
}