import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import davoApp from './reducers'
import App from './containers/App'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Socket} from 'phoenix'
import { addConn, chunkBodyConn, addRespConn } from './actions'

const store = createStore(davoApp)
const socket = new Socket('/socket', {params: {token: window.userToken}})
socket.connect()

const channel = socket.channel('users:lobby', {})
channel.join()
  .receive('ok', resp => { console.log('Joined davo successfully') })
  .receive('error', resp => { console.log('Unable to join', resp) })

channel.on('conn:req', conn => {
  // TODO: How to manually dispatch an action?
  store.dispatch(addConn(conn, channel))

  const conn_id = conn.assigns.id

  // Subscribe to updates for this conn
  channel.on('conn:req_body_chunk:' + conn_id, data => {
    const decoded_chunk = atob(data.body_chunk)
    const changeset = {
      body_chunk: decoded_chunk,
      more_body: data.more_body,
      body_type: "req_body"
    }
    store.dispatch(chunkBodyConn(conn_id, changeset))
  })

  channel.on('conn:resp:' + conn_id, conn => {
    // TODO: how to write this cleaner while whitelisting fields?
    const { status, resp_headers } = conn
    store.dispatch(addRespConn(conn_id, { status, resp_headers }))
  })

  channel.on('conn:resp_body_chunk:' + conn_id, data => {
    const decoded_chunk = atob(data.body_chunk)
    const changeset = {
      body_chunk: decoded_chunk,
      more_body: data.more_body,
      body_type: "resp_body"
    }
    store.dispatch(chunkBodyConn(conn_id, changeset))
  })
})

render(
    <Provider store={store}>
      <App />
    </Provider>,
  document.getElementById('conns')
)
