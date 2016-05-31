import { Socket } from 'phoenix'

const setupHandlers = (name, channel, dispatch) => {
  switch(name) {
  case 'users:lobby':
    channel.on('conn:req', conn => {
      dispatch({
        type: 'ADD_CONN',
        conn: conn
      })

      const conn_id = conn.assigns.id
      channel.on('conn:req_body_chunk:' + conn_id, data => {
        const decoded_chunk = atob(data.body_chunk)
        const changeset = {
          body_chunk: decoded_chunk,
          more_body: data.more_body,
          body_type: "req_body"
        }
        dispatch({
          type: 'CHUNK_BODY_CONN',
          conn_id,
          changeset
        })
      })
      channel.on('conn:resp:' + conn_id, conn => {
        // TODO: how to write this cleaner while whitelisting fields?
        const { status, resp_headers } = conn
        const changeset = { status, resp_headers }
        dispatch({
          type: 'ADD_RESP_CONN',
          conn_id,
          changeset
        })
      })
      channel.on('conn:resp_body_chunk:' + conn_id, data => {
        const decoded_chunk = atob(data.body_chunk)
        const changeset = {
          body_chunk: decoded_chunk,
          more_body: data.more_body,
          body_type: "resp_body"
        }
        dispatch({
          type: 'CHUNK_BODY_CONN',
          conn_id,
          changeset
        })
      })
    })
    break
  default:
    break
  }
}

export default {
  socket_connect: () => {
    return (dispatch) => {
      const socket = new Socket('/socket', {params: {token: window.userToken}})
      socket.connect()
      dispatch({
        type: 'SOCKET_CONNECTED',
        socket
      })
    }
  },
  channel_join: (name) => {
    return (dispatch, getState) => {
      const { socket } = getState()
      const channel = socket.socket.channel(name)
      channel.join()
        .receive('ok', () => {
          setupHandlers(name, channel, dispatch)
          dispatch({
            type: 'CHANNEL_JOINED',
            name,
            channel
          })
        })
        .receive('error', (error) => {
          dispatch({
            type: 'CHANNEL_ERROR',
            error
          })
        })
    }

  }
}
