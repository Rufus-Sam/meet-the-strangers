import * as store from './store.js'
import * as wss from './wss.js'
import * as webRtcHandler from './webRtcHandler.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as recordingUtils from "./recordingUtils.js";

//initialization of socketIO connection
const socket = io("/")
wss.registerSocketEvents(socket)

webRtcHandler.getLocalPreview();


//register event listener - personal code copy button
const personalCodeCopyButton = document.getElementById('personal_code_copy_button')
personalCodeCopyButton.addEventListener('click', () => {
    const personalCode = store.getState().socketId
    navigator.clipboard && navigator.clipboard.writeText(personalCode)
})

//register event listener - connection buttons
const personalCodeChatButton = document.getElementById('personal_code_chat_button')
const personalCodeVideoButton = document.getElementById('personal_code_video_button')


personalCodeChatButton.addEventListener('click', () => {
    const callType = constants.callType.CHAT_PERSONAL_CODE
    const calleePersonalCode = document.getElementById('personal_code_input').value
    webRtcHandler.sendPreOffer(callType, calleePersonalCode)

})
personalCodeVideoButton.addEventListener('click', () => {
    const callType = constants.callType.VIDEO_PERSONAL_CODE
    const calleePersonalCode = document.getElementById('personal_code_input').value
    webRtcHandler.sendPreOffer(callType, calleePersonalCode)
})

//event listeners for video call buttons

const micButton = document.getElementById('mic_button')
micButton.addEventListener('click', () => {
    const localStream = store.getState().localStream
    const micEnabled = localStream.getAudioTracks()[0].enabled
    localStream.getAudioTracks()[0].enabled = !micEnabled
    ui.updateMicButton(micEnabled)
})

const cameraButton = document.getElementById('camera_button')
cameraButton.addEventListener('click', () => {
    const localStream = store.getState().localStream
    const cameraEnabled = localStream.getVideoTracks()[0].enabled
    localStream.getVideoTracks()[0].enabled = !cameraEnabled
    ui.updateCameraButton(cameraEnabled)
})

const switchForScreenSharingButton = document.getElementById('screen_sharing_button')
switchForScreenSharingButton.addEventListener('click', () => {
    const screenSharingActive = store.getState().screenSharingActive
    webRtcHandler.switchBetweenCameraAndScreenSharing(screenSharingActive)
})

// messenger
const newMessageInput = document.getElementById('new_message_input')
newMessageInput.addEventListener('keydown', (event) => {
    console.log('change occured')
    const key = event.key

    if (key === 'Enter') {
        webRtcHandler.sendMessageUsingDataChannel(event.target.value)
        ui.appendMessage(event.target.value, true)
        newMessageInput.value = ''
    }
})

const sendMessage = document.getElementById('send_message_button')
sendMessage.addEventListener('click', () => {
    console.log('change occured in message button')
    const message = newMessageInput.value
    webRtcHandler.sendMessageUsingDataChannel(message)
    ui.appendMessage(message, true)
    newMessageInput.value = ''
})

// recording

const startRecordingButton = document.getElementById("start_recording_button");
startRecordingButton.addEventListener("click", () => {
    recordingUtils.startRecording();
    ui.showRecordingPanel();
});

const stopRecordingButton = document.getElementById("stop_recording_button");
stopRecordingButton.addEventListener("click", () => {
    recordingUtils.stopRecording();
    ui.resetRecordingButtons();
});

const pauseRecordingButton = document.getElementById("pause_recording_button");
pauseRecordingButton.addEventListener("click", () => {
    recordingUtils.pauseRecording();
    ui.switchRecordingButtons(true);
});

const resumeRecordingButton = document.getElementById("resume_recording_button");
resumeRecordingButton.addEventListener("click", () => {
    recordingUtils.resumeRecording();
    ui.switchRecordingButtons();
});