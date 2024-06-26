export async function playVideoFromCamera(deviceId, isMicOn) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId }, audio: true })
    if (!isMicOn) {
        stream.getAudioTracks().forEach(t => t.enabled = false)
    }
    return stream
}

export async function listMedia() {
    try {
        const list = await navigator.mediaDevices.enumerateDevices();
        return list
    } catch (error) {
        console.log(error)
    }
}