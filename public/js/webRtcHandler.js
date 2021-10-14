import * as wss from './wss.js'

export const sendPreOffer = (callType, calleePersonalCode) => {
    const data = {
        callType,
        calleePersonalCode
    }
    console.log("preoffer sent by caller")
    console.log(data)
    wss.sendPreOffer(data)
}

export const handlePreOffer = (data) => {
    console.log("preoffer got by calle")
    console.log(data)
}