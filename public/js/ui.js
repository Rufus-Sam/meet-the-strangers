import * as constants from "./constants.js"
import * as elements from './elements.js'
import * as webRtcHandler from "./webRtcHandler.js"

export const updatePersonalCode = (personalCode) => {
    const personalCodeParagraph = document.getElementById('personal_code_paragraph')
    personalCodeParagraph.innerHTML = personalCode
}

export const showIncomingCallDialog = (callType, acceptCallHandler, rejectCallHandler) => {
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? 'Chat' : 'Video'
    const incomingCallDialog = elements.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler)

    //remove all dialogs inside html element
    const dialog = document.getElementById('dialog')
    dialog.querySelectorAll('*').forEach((x) => x.remove())
    //save the incomingCallDialog 
    dialog.appendChild(incomingCallDialog)
}

export const showCallingDialog = (callingDialogRejectCallHandler) => {
    const callingDialog = elements.getCallingDialog(callingDialogRejectCallHandler)

    //remove all dialogs inside html element
    const dialog = document.getElementById('dialog')
    dialog.querySelectorAll('*').forEach((x) => x.remove())
    //save the incomingCallDialog 
    dialog.appendChild(callingDialog)
}