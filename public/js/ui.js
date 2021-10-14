import * as constants from "./constants.js"
import * as elements from './elements.js'

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

export const removeAllDialogs = () => {
    //remove all dialogs inside html element
    const dialog = document.getElementById('dialog')
    dialog.querySelectorAll('*').forEach((x) => x.remove())
}

export const showInfoDialog = (preOfferAnswer) => {
    let infoDialog = null

    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        infoDialog = elements.getInfoDialog('Call rejected', 'Callee rejected your call')
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        infoDialog = elements.getInfoDialog('Callee not found', 'Please check your personal code')
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        infoDialog = elements.getInfoDialog('Callee in different call', 'Callee is busy. Please try again later')
    }
    if (infoDialog) {
        //remove all dialogs inside html element
        const dialog = document.getElementById('dialog')
        dialog.querySelectorAll('*').forEach((x) => x.remove())
        //save the incomingCallDialog 
        dialog.appendChild(infoDialog)
        setTimeout(() => {
            removeAllDialogs()
        }, [3000])
    }
}