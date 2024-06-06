 export async function playVideoFromCamera(camera){
    try {
        const list = await navigator.mediaDevices.enumerateDevices();
        console.log("--------------------- camera: ",camera)
        console.log(list)
        let camIntId = list.filter(f => f.label.includes('Integrated'))[0]
        let micro = list.filter(f => f.label.includes('Microsoft'))[0]

        const constraints = {'video':{}}
        if(camera == 0){
            constraints.video.deviceId = camIntId  //cam int
            constraints.video.facingMode='environment'
        }else if(camera == 1){
            constraints.video.deviceId = micro   //connected

        }
        console.log(constraints)
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        console.log(stream)
        return stream
    } catch (error) {
        console.error('Error opening video camera.',error)
    }
}