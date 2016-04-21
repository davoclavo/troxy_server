import {Socket} from 'phoenix'
import React from 'react'
import ReactDOM from 'react-dom'
import {Table, Column, Cell} from 'fixed-data-table';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import classNames from 'classnames'
import moment from 'moment'

/* require('css/app') */

export let socket = new Socket('/socket', {params: {token: window.userToken}})

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

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel('users:new', {})
channel.join()
  .receive('ok', resp => { console.log('Joined davo successfully'); })
  .receive('error', resp => { console.log('Unable to join', resp) })

class Headers extends React.Component {
  render() {
    return(
      <ol>
        {Object.keys(this.props.headers).map((name, index) => {
           return (
             <li key={index}>{name}: {this.props.headers[name]}</li>
           )
         })}
      </ol>
    )
  }
}

class Request extends React.Component {
  render() {
    const conn = this.props.conn
    return(
      <div className='request'>
        <span className='method'>{conn.method}</span>
        <span className='host'>{conn.host}</span>
        <span className='port'>:{conn.port}</span>
        <span className='path'>{conn.request_path}</span>

        <span className='query_string'>{conn.query_string}</span>
        <Headers className='req_headers' headers={conn.req_headers} />
      </div>
    )
  }
}

class Response extends React.Component {
  render() {
    const conn = this.props.conn
    return(
      <div className='response'>
        <span className='status'>{conn.status}</span>
        <Headers className='resp_headers' headers={conn.resp_headers} />
        {/* TODO: Body */}
        {/* TODO: Timing */}
      </div>
    )
  }
}

class ConnRow extends React.Component {
  static defaultProps() {
    return {
      selected: false,
      focused: false
    }
  }
  render() {
    let classes = classNames({
      'is-selected': this.props.selected,
      'is-focused': this.props.focused,
      'conn': true
    })
    return(
      <tr className={classes}>
        <td>
          {this.props.conn.assigns.id}
        </td>
        <td>
          <Request conn={this.props.conn} />
        </td>
        <td>
          <Response conn={this.props.conn} />
        </td>
      </tr>
    )
  }
}

class ConnTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      conns: []
    }
  }
  componentDidMount() {
    channel.on('conn', conn => {
      console.dir(conn)
      // Should  only have one key
      let conns = this.state.conns
      conns.push(conn)

      this.setState({conns: conns})
    })
  }
  onKeyDown(event) {
    console.log(e)
  }
  render() {
    const rowNodes = this.state.conns.map(conn => {
      return(<ConnRow conn={conn} key={conn.assigns.id}/>)
    })
    return (
      <div className="table-responsive" onKeyDown={this.onKeyDown}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Request</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {rowNodes}
          </tbody>
        </table>
      </div>
    )
  }
}

ReactDOM.render(
  <ConnTable />,
  document.getElementById('conns')
)

export default socket
