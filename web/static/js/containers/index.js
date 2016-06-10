import React from 'react'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'

import App from './App'
import configureStore from '../store'

export default class Index extends React.Component {
  render() {
    let initialState = this.props.initial_state
    const store = configureStore(initialState)
    return(
        <Provider store={store}>
          <App />
        </Provider>
    )
  }
}

