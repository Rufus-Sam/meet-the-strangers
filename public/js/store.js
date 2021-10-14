let state = {
    socketId: null,
    localStream: null,
    remoteStream: null,
    screenSharingStream: null,
    allowConnectionsFromStrangers: false,
    screenSharingActive: false,
}

export const setSocketId = (socketId) => {
    state = {
        ...state,
        socketId,
    }
    console.log(state)
}

export const setLocalStream = (stream) => {
    state = {
        ...state,
        localStream: stream
    }
}

export const setRemoteStream = (stream) => {
    state = {
        ...state,
        remoteStream: stream
    }
}

export const setScreenSharingStream = (screenSharingStream) => {
    state = {
        ...state,
        screenSharingStream
    }
}

export const setAllowConnectionsFromStrangers = (allowConnection) => {
    state = {
        ...state,
        allowConnectionsFromStrangers: allowConnection
    }
}

export const setScreenSharingActive = (screenSharingActive) => {
    state = {
        ...state,
        screenSharingActive
    }
}

export const getState = () => {
    return state
}