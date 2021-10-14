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

    socket.on('pre-offer', ({ callType, calleePersonalCode }) => {
        console.log('pre-offer came to server')
    })
    socket.on('disconnect', () => {
        console.log("user disconnected")

        const newConnectedPeers = connectedPeers.filter((x) => x !== socket.id)
        connectedPeers = newConnectedPeers
        console.log(connectedPeers)
    })
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

