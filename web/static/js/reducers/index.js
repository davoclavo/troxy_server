import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import davo from './davo'
import socket from './socket'

export default combineReducers({
  routing: routerReducer,
  davo,
  socket
})
