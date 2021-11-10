const twilio = require('twilio')
const cors = require('cors')
const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const http = require('http')
const PORT = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})
app.get('/api/turn-api', (req, res) => {
    const accountSid = 'AC70b576650d89afb6d56c42ce21d651f3'
    const authToken = `${process.env.AUTHTOKEN}`
    const client = twilio(accountSid, authToken)
    client.tokens.create().then((token) => res.send({ token }))
})

let connectedPeers = []
let connectedPeerStrangers = []
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
        } else {
            const data = {
                preOfferAnswer: 'CALLEE_NOT_FOUND',
                callerSocketId: socket.id
            }
            io.to(socket.id).emit('pre-offer-answer', data)
        }
    })
    socket.on('pre-offer-answer', (data) => {

        console.log('pre offer answer came to server')
        console.log(data)
        const connectedPeer = connectedPeers.find((peerSocketId) => data.callerSocketId === peerSocketId)
        if (connectedPeer) {
            io.to(data.callerSocketId).emit('pre-offer-answer', data)
        }
    })
    socket.on('webRtc-signaling', (data) => {
        console.log('webRtc offer came to server')
        const { connectedUserSocketId } = data;

        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if (connectedPeer) {
            console.log('webRtc offer sent from server ')
            io.to(connectedUserSocketId).emit("webRtc-signaling", data);
        }
    })
    socket.on('user-hanged-up', (data) => {
        const { connectedUserSocketId } = data;

        const connectedPeer = connectedPeers.find(
            (peerSocketId) => peerSocketId === connectedUserSocketId
        );

        if (connectedPeer) {
            io.to(connectedUserSocketId).emit("user-hanged-up");
        }
    })

    socket.on('stranger-connection-status', (data) => {
        const { status } = data
        if (status) {
            connectedPeerStrangers.push(socket.id)
        } else {
            const newConnectedPeerStrangers = connectedPeerStrangers.filter((x) => x !== socket.id)
            connectedPeerStrangers = newConnectedPeerStrangers
        }
        console.log(connectedPeerStrangers)
    })
    socket.on('get-stranger-socket-id', () => {
        let randomStrangerSocketId
        const filteredConnectedPeerSocketId = connectedPeerStrangers.filter((x) => x !== socket.id)

        if (filteredConnectedPeerSocketId.length > 0) {
            randomStrangerSocketId = filteredConnectedPeerSocketId[
                Math.floor(Math.random() * filteredConnectedPeerSocketId.length)
            ]
        } else {
            randomStrangerSocketId = null
        }
        const data = { randomStrangerSocketId }
        io.to(socket.id).emit("stranger-socket-id", data)
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

