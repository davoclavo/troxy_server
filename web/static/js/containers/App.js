import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ConnView from '../components/ConnView'
import * as DavoActions from '../actions'

class App extends Component {
  render() {
    const { conns, ui, actions } = this.props
    return (
      <div>
        {/* <Header /> */}
        <ConnView conns={conns} ui={ui} actions={actions}/>
        {/* <Footer /> */}
      </div>
    )
  }
}
App.propTypes = {
  conns: PropTypes.object.isRequired,
  ui: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return state.davo
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(DavoActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
