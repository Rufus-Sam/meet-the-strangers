import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
let connectedUserDetails;

export const sendPreOffer = (callType, calleePersonalCode) => {
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode
    }

    if (callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.CHAT_PERSONAL_CODE) {
        const data = {
            callType,
            calleePersonalCode
        }
        console.log("preoffer sent by caller")
        ui.showCallingDialog(callingDialogRejectCallHandler)
        wss.sendPreOffer(data)
    }
}

export const handlePreOffer = (data) => {
    console.log("preoffer got by calle")
    const { callType, callerSocketId } = data

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    }
    if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler)
    }
}

export const acceptCallHandler = () => {
    console.log('call-accepted')
}
export const rejectCallHandler = () => {
    console.log('call-rejected')
}
export const callingDialogRejectCallHandler = () => {
    console.log('cancel the call')
}