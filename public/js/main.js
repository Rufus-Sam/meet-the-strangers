import * as store from './store.js'
import * as wss from './wss.js'
import * as webRtcHandler from './webRtcHandler.js'
import * as constants from './constants.js'

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
