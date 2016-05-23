import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import index from './reducers'
import App from './components/App'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

let store = createStore(index)

render(
    <Provider store={store}>
      <App />
    </Provider>,
  document.getElementById('conns')
)
