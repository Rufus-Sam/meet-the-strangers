import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as store from './store.js'


let connectedUserDetails
let peerConnection
const defaultConstraints = {
    audio: true,
    video: true,
}

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:13902",
        },
    ],
}

export const getLocalPreview = () => {
    navigator.mediaDevices
        .getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        })
        .catch((err) => {
            console.log("error occured when trying to get an access to camera");
            console.log(err);
        });
};

const createPeerConnection = () => {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
        console.log("getting ice candidates from stun server");
        if (event.candidate) {
            // send our ice candidates to other peer
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
    };

    // add our stream to peer connection

    if (connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
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
        wss.sendPreOffer(data)
    }
}

export const handlePreOffer = (data) => {
    console.log("preoffer got by calle")
    const { callType, callerSocketId } = data

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    }
    if (callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE) {
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler)
    }
}

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data
    console.log('pre offer answer came back to caller (webrtc)')
    ui.removeAllDialogs()

    if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
        ui.showInfoDialog(preOfferAnswer)
        //show dialog that callee was not found
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
        ui.showInfoDialog(preOfferAnswer)
        //show dialog that callee is busy
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
        ui.showInfoDialog(preOfferAnswer)
        //show dialog that callee rejecte the call
    }
    if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
        ui.showCallElements(connectedUserDetails.callType);
        //send webRtc offer
    }
}

export const acceptCallHandler = () => {
    console.log('call-accepted')
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
    ui.showCallElements(connectedUserDetails.callType);
}
export const rejectCallHandler = () => {
    console.log('call-rejected')
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED)
}
export const callingDialogRejectCallHandler = () => {
    console.log('cancel the call')
}

const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer
    }
    ui.removeAllDialogs()
    wss.sendPreOfferAnswer(data)
}