import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import reducers from '../reducers'
import socketActions from '../actions/socket'

/* const store = createStore(davo)*/
const devToolsExt = typeof window.devToolsExtension !== 'undefined' ?
        window.devToolsExtension()
        : f => f

export default function configureStore(initialState) {
  const store = createStore(
    reducers,
    initialState,
    compose(
      applyMiddleware(thunkMiddleware),
      devToolsExt
    )
  )
  store.dispatch(socketActions.socket_connect())
  store.dispatch(socketActions.channel_join('users:lobby'))
  return store
}
