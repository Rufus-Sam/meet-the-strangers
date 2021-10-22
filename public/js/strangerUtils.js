import * as wss from './wss.js'
import * as ui from './ui.js'
import * as webRtcHandler from './webRtcHandler.js'


let strangerCallType

export const changeStrangerConnectionStatus = (status) => {
    const data = { status }
    wss.changeStrangerConnectionStatus(data)
}
export const getStrangerSocketIdAndConnect = (callType) => {
    strangerCallType = callType
    wss.getStrangerSocketId()
}
export const connectWithStranger = (data) => {
    console.log(data.randomStrangerSocketId)
    if (data.randomStrangerSocketId) {
        webRtcHandler.sendPreOffer(strangerCallType, data.randomStrangerSocketId)
    } else {
        //no users are available
        ui.showNoStrangerAvailableDialog()
    }

}