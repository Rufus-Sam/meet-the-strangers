import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as store from './store.js'
import * as turn from './turn.js'


let connectedUserDetails
let peerConnection
let dataChannel
const defaultConstraints = {
    audio: true,
    video: true,
}



export const getLocalPreview = () => {
    navigator.mediaDevices
        .getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            ui.showVideoCallButtons()
            store.setCallState(constants.callState.CALL_AVAILABLE)
            store.setLocalStream(stream);
        })
        .catch((err) => {
            console.log("error occured when trying to get an access to camera");
            console.log(err);
        });
};

const createPeerConnection = () => {
    const turnServers = turn.getTurnServers()
    const configuration = {
        iceServers: [...turnServers, { url: "stun:stun.1und1.de:3478" }],
        iceTransportPolicy: 'relay'
    }
    peerConnection = new RTCPeerConnection(configuration);
    //chat data channel
    dataChannel = peerConnection.createDataChannel('chat')

    peerConnection.ondatachannel = (event) => {
        const channel = event.channel

        channel.onopen = () => {
            console.log('channel has been opened,ready to receive messages')
        }

        channel.onmessage = (event) => {
            console.log('message came')
            const message = JSON.parse(event.data)
            ui.appendMessage(message)
            console.log(message)

        }
    }

    peerConnection.onicecandidate = (event) => {
        console.log("getting ice candidates from stun server");
        if (event.candidate) {
            // send our ice candidates to other peer
            wss.sendDataUsingWebRtcSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRtcSignaling.ICE_CANDIDATE,
                candidate: event.candidate
            })
        }
    };

    peerConnection.onconnectionstatechange = (event) => {
        if (peerConnection.connectionState === "connected") {
            console.log("succesfully connected with other peer");
        }
    };

    // receiving tracks
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
        console.log('receiving tracks')
    };

    // add our video stream to peer connection

    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
    ) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
            console.log('adding tracks')
        }
    }
};
export const sendPreOffer = (callType, calleePersonalCode) => {
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode
    }

    if (callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.CHAT_PERSONAL_CODE) {
        const data = {
            callType,
            calleePersonalCode
        }
        console.log("preoffer sent by caller")
        ui.showCallingDialog(callingDialogRejectCallHandler)
        store.setCallState(constants.callState.CALL_UNAVAILABLE)
        wss.sendPreOffer(data)
    }
    if (callType === constants.callType.VIDEO_STRANGER || callType === constants.callType.CHAT_STRANGER) {
        const data = {
            callType,
            calleePersonalCode
        }
        console.log("preoffer sent by caller")
        store.setCallState(constants.callState.CALL_UNAVAILABLE)
        wss.sendPreOffer(data)
    }
}

export const handlePreOffer = (data) => {
    console.log("preoffer got by calle")
    const { callType, callerSocketId } = data

    if (!checkCallPossibility(callType)) {
        return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE, callerSocketId)
    }

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    }

    store.setCallState(constants.callState.CALL_UNAVAILABLE)

    if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler)
    }
    if (callType === constants.callType.CHAT_STRANGER || callType === constants.callType.VIDEO_STRANGER) {
        createPeerConnection()
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
        ui.showCallElements(connectedUserDetails.callType)
    }
}

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data
    console.log('pre offer answer came back to caller (webrtc)')
    ui.removeAllDialogs()

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        setIncomingCallAvailability()
        ui.showInfoDialog(preOfferAnswer)
        //show dialog that callee was not found
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        setIncomingCallAvailability()
        ui.showInfoDialog(preOfferAnswer)
        //show dialog that callee is busy
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        setIncomingCallAvailability()
        ui.showInfoDialog(preOfferAnswer)
        //show dialog that callee rejecte the call
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        createPeerConnection()
        ui.showCallElements(connectedUserDetails.callType);
        //send webRtc offer
        sendWebRtcOffer()
    }
}

// caller sends offer 
const sendWebRtcOffer = async () => {
    console.log('sending webRtc offer from caller side')
    const offer = await peerConnection.createOffer();
    //caller - local - offer 
    await peerConnection.setLocalDescription(offer);
    wss.sendDataUsingWebRtcSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRtcSignaling.OFFER,
        offer: offer,
    });
}
//callee receives offer
export const handleWebRtcOffer = async (data) => {
    console.log('webRtc offer came to callee')
    console.log(data)
    //callee - remote - offer 
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    //callee - local - answer 
    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRtcSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRtcSignaling.ANSWER,
        answer: answer,
    });
}
//caller receives answer
export const handleWebRtcAnswer = async (data) => {
    console.log("webRTC Answer came back to caller");
    //caller - remote - answer 
    await peerConnection.setRemoteDescription(data.answer);
};
//video showing
export const handleWebRtcCandidate = async (data) => {
    console.log('handling incoming webRtc candidates')
    try {
        await peerConnection.addIceCandidate(data.candidate)
    } catch (error) {
        console.log('error occured when getting ice candidates', error)

    }
}
//screen sharing
let screenSharingStream;

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) => {
    if (screenSharingActive) {
        const localStream = store.getState().localStream;
        const senders = peerConnection.getSenders();

        const sender = senders.find((sender) => {
            return sender.track.kind === localStream.getVideoTracks()[0].kind;
        });

        if (sender) {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
        }

        // stop screen sharing stream

        store
            .getState()
            .screenSharingStream.getTracks()
            .forEach((track) => track.stop());

        store.setScreenSharingActive(!screenSharingActive);

        ui.updateLocalVideo(localStream);
    } else {
        console.log("switching for screen sharing");
        try {
            screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
            });
            store.setScreenSharingStream(screenSharingStream);

            // replace track which sender is sending
            const senders = peerConnection.getSenders();

            const sender = senders.find((sender) =>
                sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
            );

            if (sender) {
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
            }

            store.setScreenSharingActive(!screenSharingActive);

            ui.updateLocalVideo(screenSharingStream);
        } catch (err) {
            console.error("error occured when trying to get screen sharing stream", err);
        }
    }
};

//chat data channel
export const sendMessageUsingDataChannel = (message) => {
    const stringifiedMessage = JSON.stringify(message)
    dataChannel.send(stringifiedMessage)
}


const acceptCallHandler = () => {
    console.log('call-accepted')
    createPeerConnection()
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
    ui.showCallElements(connectedUserDetails.callType);
}
const rejectCallHandler = () => {
    console.log('call-rejected')
    setIncomingCallAvailability()
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED)
}
const callingDialogRejectCallHandler = () => {
    console.log('cancel the call')
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId
    }
    closePeerConnectionAndResetState()
    wss.sendUserHangedUp(data)
}

const sendPreOfferAnswer = (preOfferAnswer, callerSocketId = null) => {
    const socketId = callerSocketId ? callerSocketId : connectedUserDetails.socketId
    const data = {
        callerSocketId: socketId,
        preOfferAnswer
    }
    ui.removeAllDialogs()
    wss.sendPreOfferAnswer(data)
}

// hang up 
export const handleHangUp = () => {
    console.log(' finishing the call')
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId
    }
    wss.sendUserHangedUp(data)
    closePeerConnectionAndResetState()
}
export const handleConnectedUserHangedUp = () => {
    console.log('user has hanged up')
    closePeerConnectionAndResetState()
}

const closePeerConnectionAndResetState = () => {
    if (peerConnection) {
        peerConnection.close()
        peerConnection = null
    }
    //active mic and camera for local stream
    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER
    ) {
        store.getState().localStream.getAudioTracks()[0].enabled = true
        store.getState().localStream.getVideoTracks()[0].enabled = true
    }
    ui.updateAfterHangUp(connectedUserDetails.callType)
    setIncomingCallAvailability()
    connectedUserDetails = null
}

//check call possibility
const checkCallPossibility = (callType) => {
    const callState = store.getState().callState
    if (callState === constants.callState.CALL_AVAILABLE) {
        return true
    }
    if ((callState === constants.callState.CALL_AVAILABLE_ONLY_CHAT) &&
        (callType === constants.callType.VIDEO_PERSONAL_CODE || callType === constants.callType.VIDEO_STRANGER)) {
        return false
    }
    return false
}

//set our state for calls
const setIncomingCallAvailability = () => {
    const localStream = store.getState().localStream
    if (localStream) {
        store.setCallState(constants.callState.CALL_AVAILABLE)
    } else {
        store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT)
    }
}