import {Socket} from 'phoenix';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactList from 'react-list';

import classNames from 'classnames';
import moment from 'moment';
import rasterizeHTML from 'rasterizehtml';
import RadioGroup from 'react-radio';
import AceEditor from 'react-ace';


import brace from 'brace';
import 'brace/mode/html';
import 'brace/theme/github';
import 'brace/theme/monokai';

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

// TODO: Maybe this could be a function component
class Headers extends React.Component {
  render() {
    return(
      <ol className="headers">
        {Object.keys(this.props.headers).map((name, index) => {
           return (
             <li key={index}>{name}: {this.props.headers[name]}</li>
           );
         })}
      </ol>
    );
  }
}


class Body extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      render_type: "auto"
    };
    this.handleRenderType = this.handleRenderType.bind(this);
  }
  render() {
    let element;
    if(this.props.more_body){
      element = <div/>;
    } else {
      const content_type = this.props.content_type;
      switch(this.state.render_type) {
        case "auto":
            if(content_type == "image/gif"){
              const data = 'data:'+content_type+';base64,'+btoa(this.props.body);
              element = <img src={data}/>;
            }
            break;
        case "raw":
          element = <span className='body'>{this.props.body}</span>;
          break;
        case "editor":
        element =  <AceEditor width="100%" mode="html" theme="monokai" name={this._reactInternalInstance._rootNodeID} value={this.props.body} />;
          break;
        case "iframe":
          element = <iframe srcDoc={this.props.body}></iframe>;
          break;
      case "shadowdom":
        element = <div ref="shadow"/>;
        break;
        case "data":
          const content_type = this.props.content_type.split(";")[0];
          element = <a target="_blank" rel="noopener noreferrer" href={'data:' + content_type + ';davo.io,' + escape(this.props.body)}>Open body in new tab.</a>;
          break;
        case "canvas":
          element = <canvas className="body" ref={(ref) => this.rasterizingCanvas = ref}></canvas>;
          break;
        case "switcharoo":
          // http://lcamtuf.coredump.cx/switch/
          break;
      }
    }
    return (
      <div className="body">
        <div className="btn-group-sm">
            <RadioGroup className="render_type" name={this._reactInternalInstance._rootNodeID} value={this.state.render_type} items={this.props.render_types} onChange={this.handleRenderType} renderRadio={this.renderRadio} />
        </div>

        {element}
      </div>
    );
  }
  renderRadio(props, index, arr) {
    return (
      <label className="btn btn-default" {...props} />
    );
  }
  handleRenderType(render_type) {
    this.setState({render_type});
  }
  componentDidUpdate() {
    if(!this.props.more_body && this.state.render_type == "canvas"){
      rasterizeHTML.drawHTML(this.props.body, this.rasterizingCanvas);
    }
    if(!this.props.more_body && this.state.render_type == "shadowdom"){
      this.refs.shadow.createShadowRoot();
      this.refs.shadow.innerHTML = this.props.body;
    }
  }
}
Body.defaultProps = {
  content_type: 'text/html',
  render_types: [
    'auto', 'editor', 'raw', 'iframe', 'canvas', 'data', 'shadowdom'
  ]
};

class Request extends React.Component {
  render() {
    const conn = this.props.conn;
    return(
      <div className='request'>
        <span className='method'>{conn.method}</span>
        <span className='host'>{conn.host}</span>
        :<span className='port'>{conn.port}</span>
        <span className='path'>{conn.request_path}</span>

        <span className='query_string'>{conn.query_string}</span>
        <Headers className='req_headers' headers={conn.req_headers} />
        <Body className='req_body' content_type={this.props.conn.req_headers['content-type']} body={this.props.conn.req_body} more_body={this.props.more_body}/>
      </div>
    );
  }
}

class Response extends React.Component {
  render() {
    const conn = this.props.conn;
    return(
      <div className='response'>
        <span className='status'>{this.props.conn.status}</span>
        <Headers className='resp_headers' headers={this.props.conn.resp_headers} />
        <Body className='resp_body' content_type={this.props.conn.resp_headers['content-type']} body={this.props.conn.resp_body} more_body={this.props.more_body}/>
        {/* TODO: Timing */}
        {/* TODO: SSL */}
        {/* TODO: Settings(follow_redirects?) */}
      </div>
    );
  }
}
Response.defaultProps = {
  render: 'editor'
};


class ConnView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      conns: {},
      ui: {
        selectedConn: null
      }
    };
    this.clickHandler = (conn_id) => (e) => this.click(conn_id, e);
  }
  click(conn_id, e) {
    this.setState({
      ui: {
        selectedConn: conn_id
      }
    });
  }
  componentDidMount() {
    channel.on('conn:req', conn => {
      let conns = this.state.conns;
      const conn_id = conn.assigns.id;
      conns[conn_id] = conn;
      this.setState({ conns });

      channel.on('conn:req_body_chunk:' + conn_id, data => {
        const conn = this.state.conns[conn_id];
        const decoded_chunk = atob(data.body_chunk);

        let updated_conns = Object.assign({}, this.state.conns, {
          [conn_id]: Object.assign({}, conn, {
            req_body: (conn.req_body || "") + decoded_chunk,
            more_body: data.more_body
          })
        });
        this.setState({
          conns: updated_conns
        });
      });
      channel.on('conn:resp:' + conn_id, conn => {
        let updated_conns = Object.assign({}, this.state.conns, {
          [conn_id]: Object.assign({}, this.state.conns[conn_id], conn)
        });

        this.setState({
          conns: updated_conns
        });
      });
      channel.on('conn:resp_body_chunk:' + conn_id, data => {
        const conn = this.state.conns[conn_id];
        const decoded_chunk = atob(data.body_chunk);
        let updated_conns = Object.assign({}, this.state.conns, {
          [conn_id]: Object.assign({}, conn, {
            resp_body: (conn.resp_body || "") + decoded_chunk,
            more_body: data.more_body
          })
        });

        this.setState({
          conns: updated_conns
        });
      });
    });
  }
  render() {
    const conns = this.state.conns;
    return (
      <div>
        {/* `lastChange` is a hack to render the ReactList on every change, it seems it doesnt detect deep changes in objects, such as `more_body` in conns */}
        <ConnSidebar conns={conns} clickHandler={this.clickHandler} selectedConn={this.state.ui.selectedConn} lastChange={new Date()}/>
        <ConnDetails conn={conns[this.state.ui.selectedConn]} />
      </div>
    );
  }
}

class ConnSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }
  renderItem(index, key) {
    const conn_id = Object.keys(this.props.conns)[index];
    const conn = this.props.conns[conn_id];
    return <ConnSummary conn={conn} key={key} selected={conn_id === this.props.selectedConn} clickHandler={this.props.clickHandler} />;
  }
  render() {
    const conns = this.props.conns;
    return(
      <div className='sidebar'>
        <ReactList
              itemRenderer={this.renderItem}
              length={Object.keys(this.props.conns).length}
              type='uniform'
              updateWhenThisValueChanges={this.props.selectedConn}
            />
      </div>
    );
  }
}

class ConnDetails extends React.Component {
  render() {
    const conn = this.props.conn;
    if(conn == null) {
      return <marquee><blink>set your proxy to localhost:4000</blink></marquee>;
    } else {
      return (
        <div className='details'>
          <Request conn={this.props.conn} />
          <Response conn={this.props.conn} />
        </div>
      );
    }
  }
}

class ConnSummary extends React.Component {
  constructor(props) {
    super(props);
    this.resendConn = this.resendConn.bind(this);
  }
  resendConn() {
    console.warn("Request! " + this.props.conn.request_path);
    const conn = this.props.conn;
    let xhr = new XMLHttpRequest();
    // Send request to window.location.origin and add x-troxy-host header
    let uri = new URL(window.location.origin);
    
    // TODO: Support this notation i.imgur.com.davo.io
    /* uri.host = conn.host + "." + uri.host; */

    let target_uri = Object.assign(uri,
      {
        pathname: conn.request_path,
        /* hash: "",
           host: window.location.host,
           origin: "http://stackoverflow.com",
           password: "",
           port: "",
           protocol: "http:",
           search: "",
           username: "" */
      });

    // TODO: Write a host rewrite for Troxy
    xhr.open('GET', target_uri.href, true);
    xhr.setRequestHeader("X-Troxy-Host", conn.host);
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("Pragma", "no-cache");

    xhr.send();
  }
  render() {
    const classes = classNames({
      'is-selected': this.props.selected,
      'conn': true
    });
    return(
      <div className={classes} onClick={this.props.clickHandler(this.props.conn.assigns.id)}>
        <span className='method'>{this.props.conn.method}</span>
        <span className='path'>{this.props.conn.request_path}</span>
        <a className='action--resend' onClick={this.resendConn}><span className='glyphicon glyphicon-repeat'></span></a>
        <br/>
        <span className='status'>{this.props.conn.status}</span>
        <span>{this.props.conn.resp_headers['content-type']}</span>
      </div>
    );
  }
}

ReactDOM.render(
  <ConnView />,
  document.getElementById('conns')
);

export default socket;
