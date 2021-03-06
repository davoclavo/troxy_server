import React, { Component, PropTypes } from 'react'
import RadioGroup from 'react-radio'
import rasterizeHTML from 'rasterizehtml'
import AceEditor from 'react-ace'
import brace from 'brace'
import 'brace/mode/html'
import 'brace/theme/github'
import 'brace/theme/monokai'
import pako from 'pako'

class Body extends Component {
  constructor(props) {
    super(props)
    this.state = {
      render_type: "auto"
    }
    this.handleRenderType = this.handleRenderType.bind(this)
  }
  render() {
    let element
    if(this.props.more_body){
      element = <div/>
    } else {
      let body = this.props.body
      if (this.props.headers['content-encoding'] == 'gzip') {
        const compressedBody = this.props.body.split('').map(function(x){return x.charCodeAt(0)})
        const compressedBodyBin = new Uint8Array(compressedBody)
        const bodyBin = pako.inflate(compressedBodyBin)
        body = String.fromCharCode.apply(null, new Uint8Array(bodyBin))
      }

      const content_type = this.props.headers['content-type']
      switch(this.state.render_type) {
        case "auto":
            if(content_type && content_type.startsWith("image/")){
              const data = 'data:'+content_type+';base64,'+btoa(body)
              element = <img src={data}/>
            } else {
              element = <AceEditor width="100%" mode="html" theme="monokai" name={this._reactInternalInstance._rootNodeID} value={body} />
            }
            break
        case "raw":
          element = <span className='body'>{body}</span>
          break
        case "editor":
        element =  <AceEditor width="100%" mode="html" theme="monokai" name={this._reactInternalInstance._rootNodeID} value={body} />
          break
        case "iframe":
          element = <iframe srcDoc={body}></iframe>
          break
      case "shadowdom":
        element = <div ref="shadow"/>
        break
        case "data":
          const content_type_without_opts = content_type.split(";")[0]
          element = <a target="_blank" rel="noopener noreferrer" href={'data:' + content_type_without_opts + ';davo.io,' + escape(body)}>Open body in new tab.</a>
          break
        case "canvas":
          element = <canvas className="body" ref={(ref) => this.rasterizingCanvas = ref}></canvas>
          break
        case "switcharoo":
          // http://lcamtuf.coredump.cx/switch/
          break
      }
    }
    return (
      <div className="body">
        <div className="btn-group-sm">
            <RadioGroup className="render_type" name={this._reactInternalInstance._rootNodeID} value={this.state.render_type} items={this.props.render_types} onChange={this.handleRenderType} renderRadio={this.renderRadio} />
        </div>

        {element}
      </div>
    )
  }
  renderRadio(props, index, arr) {
    return (
      <label className="btn btn-default" {...props} />
    )
  }
  handleRenderType(render_type) {
    this.setState({render_type})
  }
  componentDidUpdate() {
    if(!this.props.more_body && this.state.render_type == "canvas"){
      rasterizeHTML.drawHTML(this.props.body, this.rasterizingCanvas)
    }
    if(!this.props.more_body && this.state.render_type == "shadowdom"){
      this.refs.shadow.createShadowRoot()
      this.refs.shadow.innerHTML = this.props.body
    }
  }
}
Body.defaultProps = {
  render_types: [
    'auto', 'editor', 'raw', 'iframe', 'canvas', 'data', 'shadowdom'
  ]
}
Body.propTypes = {
  render_types: PropTypes.array.isRequired,
  headers: PropTypes.object,
  body: PropTypes.string,
  more_body: PropTypes.bool
}


export default Body
