import * as store from './store.js'
import * as ui from './ui.js'
import * as webRtcHandler from './webRtcHandler.js'
let socketIO = null;

export const registerSocketEvents = (socket) => {
    socketIO = socket
    //this part is the client calling the server,the part in app.js is the server 
    // receiving the call
    socket.on('connect', () => {
        console.log('successfully connected to wss/socket.io server')
        store.setSocketId(socket.id)
        ui.updatePersonalCode(socket.id)
    })

    socket.on('pre-offer', (data) => {
        console.log("preoffer sent from server to calle")
        console.log(data)
        webRtcHandler.handlePreOffer(data)
    })

    socket.on('pre-offer-answer', (data) => {
        webRtcHandler.handlePreOfferAnswer(data)
    })
}

export const sendPreOffer = (data) => {
    console.log("preoffer send to server")
    console.log(data)
    socketIO.emit('pre-offer', data)
}

export const sendPreOfferAnswer = (data) => {
    console.log('send preoffer answer')
    socketIO.emit('pre-offer-answer', data)
}
