import * as store from './store.js'
const socket = io("/")

//this part is the client calling the server,the part in app.js is the server 
// receiving the call
socket.on('connect', () => {
    console.log('successfully connected to wss/socket.io server')
    console.log(socket.id)
    store.setSocketId(socket.id);
})