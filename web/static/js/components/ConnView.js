import {Socket} from 'phoenix';
import React, { PropTypes } from 'react'
import ConnDetails from './ConnDetails';
import ConnSidebar from './ConnSidebar';

/* require('css/app') */

export let socket = new Socket('/socket', {params: {token: window.userToken}});

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
// Or remove it
// from connect if you don't care about authentication.

socket.connect();

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel('users:lobby', {});
channel.join()
  .receive('ok', resp => { console.log('Joined davo successfully'); })
  .receive('error', resp => { console.log('Unable to join', resp); });

class ConnView extends React.Component {
  componentDidMount() {
    channel.on('conn:req', conn => {
      const conn_id = conn.assigns.id;
      this.props.addConn(conn)

      channel.on('conn:req_body_chunk:' + conn_id, data => {
        const conn = this.props.conns[conn_id];
        const decoded_chunk = atob(data.body_chunk);

        const updated_conn = Object.assign({}, conn, {
            req_body: (conn.req_body || "") + decoded_chunk,
            more_body: data.more_body
          })
        this.props.updateConn(updated_conn)
      });
      channel.on('conn:resp:' + conn_id, conn => {
        this.props.updateConn(conn)
      });
      channel.on('conn:resp_body_chunk:' + conn_id, data => {
        const conn = this.props.conns[conn_id];
        const decoded_chunk = atob(data.body_chunk);

        const updated_conn = Object.assign({}, conn, {
          resp_body: (conn.resp_body || "") + decoded_chunk,
          more_body: data.more_body
        })
        this.props.updateConn(updated_conn)
      });
    });
  }
  render() {
    const conns = this.props.conns;
    return (
      <div>
        <ConnSidebar
           conns={conns}
           selectConn={this.props.selectConn}
           selected_conn_id={this.props.ui.selected_conn_id}
           sendConn={this.props.sendConn}
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
  selectConn: PropTypes.func.isRequired,
  addConn: PropTypes.func.isRequired,
  sendConn: PropTypes.func.isRequired
}

export default ConnView
