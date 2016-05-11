import {Socket} from 'phoenix'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import classNames from 'classnames'
import moment from 'moment'
import rasterizeHTML from 'rasterizehtml'
import RadioGroup from 'react-radio'


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
let channel = socket.channel('users:lobby', {})
channel.join()
  .receive('ok', resp => { console.log('Joined davo successfully'); })
  .receive('error', resp => { console.log('Unable to join', resp) })

class Headers extends React.Component {
  render() {
    return(
      <ol className="headers">
        {Object.keys(this.props.headers).map((name, index) => {
           return (
             <li key={index}>{name}: {this.props.headers[name]}</li>
           )
         })}
      </ol>
    )
  }
}


class Body extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      render_type: "data"
    }
    this.handleRenderType = this.handleRenderType.bind(this)
  }
  render() {
    let element
    if(this.props.more_body){
      element = <div/>
    } else {
      switch(this.state.render_type) {
        case "auto":
        if(this.props.content_type == "image/gif"){
          element = <img src={escape(this.props.body)}/>
        }
            // TODO based off content-type
            break;
        case "raw":
          element = <span className='body'>{this.props.body}</span>
          break;
        case "iframe":
          element = <iframe srcDoc={this.props.body}></iframe>
          break;
        case "data":
          const content_type = this.props.content_type.split(";")[0]
          element = <a target="_blank" rel="noopener noreferrer" href={'data:' + content_type + ';davo.io,' + escape(this.props.body)}>Open body in new tab.</a>
          break;
        case "canvas":
          element = <canvas className="body" ref={(ref) => this.rasterizingCanvas = ref}></canvas>
          break;
        case "switcharoo":
          // http://lcamtuf.coredump.cx/switch/
          break;
      }
    }
    const classes = classNames({
      'hidden': this.state.more_body
    })
    return (
      <div className={classes}>
        <RadioGroup name={this._reactInternalInstance._rootNodeID} value={this.state.render_type} items={this.props.render_types} onChange={this.handleRenderType} />
        {element}
      </div>
    );
  }
  handleRenderType(render_type) {
    this.setState({render_type});
  }
  componentDidUpdate() {
    if(!this.props.more_body && this.state.render_type == "canvas"){
      rasterizeHTML.drawHTML(this.props.body, this.rasterizingCanvas)
    }
  }
}
Body.defaultProps = {
  content_type: 'text/html',
  render_types: [
    'auto', 'raw', 'iframe', 'canvas', 'data'
  ]
}

class Request extends React.Component {
  render() {
    const conn = this.props.conn
    return(
      <div className='request'>
        <span className='method'>{conn.method}</span>
        <span className='host'>{conn.host}</span>
        :<span className='port'>{conn.port}</span>
        <span className='path'>{conn.request_path}</span>

        <span className='query_string'>{conn.query_string}</span>
        <Headers className='req_headers' headers={conn.req_headers} />
      </div>
    )
  }
}

class Response extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      body: '',
      more_body: true,
      render: 'rasterizehtml',
      conn: {
        status: '',
        resp_headers: {}
      }
    }
  }
  componentDidMount() {
    const conn_id = this.props.conn.assigns.id
    channel.on('conn:resp' + conn_id, conn => {
      this.setState({
        conn: conn
      })
    })
    channel.on('conn:resp_body_chunk:' + conn_id, data => {
      /* console.dir(data.body_chunk) */
      let decoded_chunk = atob(data.body_chunk)
      let body = this.state.body + decoded_chunk
      // TODO: Merge, not replace state
      if(!data.more_body) {
        console.log(body)
      }
      this.setState({body: body, more_body: data.more_body})
    })

  }
  render() {
    const conn = this.props.conn
    return(
      <div className='response'>
        <span className='status'>{this.state.conn.status}</span>
        <Headers className='resp_headers' headers={this.state.conn.resp_headers} />
        <Body className='resp_body' content_type={this.state.conn.resp_headers['content-type']} body={this.state.body} more_body={this.state.more_body}/>
        {/* TODO: Timing */}
        {/* TODO: SSL */}
        {/* TODO: Settings(follow_redirects?) */}
      </div>
    )
  }
}

class ConnRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      selected: false,
    }
  }
  render() {
    const classes = classNames({
      'is-collapsed': this.state.collapsed,
      'is-selected': this.state.selected,
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
    channel.on('conn:req', conn => {
      // Should  only have one key
      let conns = this.state.conns
      conns.push(conn)

      this.setState({conns: conns})
    })
  }
  onKeyDown(event) {
    console.log(event)
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
