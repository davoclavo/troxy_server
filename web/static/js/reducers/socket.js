const initialState = {
  socket: null,
  channels: {}
}

const reducer = (state = initialState, action = {}) => {
  switch(action.type) {
  case 'SOCKET_CONNECTED':
    return {
      ...state,
      socket: action.socket
    }
  case 'CHANNEL_JOINED':
    return {
      ...state,
      channels: {
        ...state.channels,
        [action.name]: action.channel
      }
    }
  case 'CHANNEL_ERROR':
    console.error(action.error)
    return state
  default:
    return state
  }
}

export default reducer
