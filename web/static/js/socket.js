import {Socket} from 'phoenix'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import classNames from 'classnames'
import moment from 'moment'

// require('css/app')

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

class Header extends React.Component {
  render() {
    return (
      <li>{this.props.name}: {this.props.value}</li>
    )
  }
}

class HeaderList extends React.Component {
  render() {
    return(
      <ul>
      {Object.keys(this.props.headers).map((name) => {
        return (
          <Header name={name} value={this.props.headers[name]} key={name} />
        )
      })}
      </ul>
    )
  }
}

class Request extends React.Component {
  render() {
    const conn = this.props.conn
    console.dir(conn)
    return(
      <div className='request'>
        <span className='method'>{conn.method}</span>
        <span className='host'>{conn.host}</span>
        <span className='port'>:{conn.port}</span>
        <span className='path'>{conn.request_path}</span>
        <span className='query_string'>{conn.query_string}</span>
        <HeaderList className='req_headers' headers={conn.req_headers} />
      </div>
    )
  }
}

class Response extends React.Component {
  render() {
    const conn = this.props.conn
    return(
      <div className='response'>
        <HeaderList className='resp_headers' headers={conn.resp_headers} />
        {/* TODO: Body */}
        {/* TODO: Timing */}
      </div>
    )
  }
}

class Conn extends React.Component {
  render() {
    const conn = this.props.conn
    return(
      <div className='conn'>
        <Request conn={conn} />
        <Response conn={conn} />
      </div>
    )
  }
}

class ListItem extends React.Component {
  static defaultProps() {
    return {
      selected: false,
      focused: false
    }
  }
  render() {
    let classes = classNames({
      'is-selected': this.props.selected,
      'is-focused': this.props.focused
    })
    return(
      <li className={classes}>
        {this.props.child}
      </li>
    )
  }
}


class SelectableList extends React.Component {
  static defaultProps() {
    return {
      children: []
    }
  }
  onKeyDown(event) {
    console.log(event)
  }
  render() {
      const childNodes = this.props.children.map((child, key) => {
        return(<ListItem child={child} key={key} />)
    })
    return (
      <ul onKeyDown={this.onKeyDown}>
        {childNodes}
      </ul>
    )
  }
}

class ConnList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      conns: {}
    }
  }
  componentDidMount() {
    channel.on('conn', conn => {
      // Should  only have one key
      Object.keys(conn).map(id => {
        let conns = this.state.conns
        conns[id] = conn[id]

        this.setState({conns: conns})
      })
    })
  }
  render() {
    const connComponents = Object.keys(this.state.conns).map(id => {
      const conn = this.state.conns[id]
      return(<Conn conn={conn} key={id}/>)
    })
    return (
      <SelectableList children={connComponents} />
    )
  }
}

ReactDOM.render(
    <ConnList />,
  document.getElementById('conns')
)

export default socket
