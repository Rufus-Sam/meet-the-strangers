const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const http = require('http')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

let connectedPeers = []

//io.on() is an event listener on server, socket.on() is event listener on client 
io.on('connection', (socket) => {
    connectedPeers.push(socket.id);
    console.log(connectedPeers)
    socket.on('pre-offer', (data) => {
        const { callType, calleePersonalCode } = data
        console.log(calleePersonalCode)
        const connectedPeer = connectedPeers.find((peerSocketId) => calleePersonalCode === peerSocketId)
        console.log(connectedPeer)
        if (connectedPeer) {
            const data = {
                callerSocketId: socket.id,
                callType
            }
            console.log("preoffer got by server")
            io.to(calleePersonalCode).emit('pre-offer', data)
        }
    })
    socket.on('disconnect', () => {
        console.log("user disconnected")

        const newConnectedPeers = connectedPeers.filter((x) => x !== socket.id)
        connectedPeers = newConnectedPeers
    })
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

