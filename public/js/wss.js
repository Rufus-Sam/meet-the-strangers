import * as store from './store.js'
import * as ui from './ui.js'

let socketIO = null;

export const registerSocketEvents = (socket) => {
    //this part is the client calling the server,the part in app.js is the server 
    // receiving the call
    socket.on('connect', () => {

        console.log('successfully connected to wss/socket.io server')
        socketIO = socket
        store.setSocketId(socket.id)
        ui.updatePersonalCode(socket.id)
    })
}

export const sendPreOffer = (data) => {
    socketIO.emit('pre-offer', data)
}

