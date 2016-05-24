import React, { Component, PropTypes } from 'react'
import ConnDetails from './ConnDetails';
import ConnSidebar from './ConnSidebar';

/* require('css/app') */
class ConnView extends Component {
  render() {
    const conns = this.props.conns;
    const { selectConn, sendConn } = this.props.actions
    return (
      <div>
        <ConnSidebar
           conns={conns}
           selectConn={selectConn}
           selected_conn_id={this.props.ui.selected_conn_id}
           sendConn={sendConn}
           />
        <ConnDetails
           conn={conns[this.props.ui.selected_conn_id]}
           />
      </div>
    );
  }
}
ConnView.propTypes = {
  ui: PropTypes.object.isRequired,
  conns: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default ConnView
