import React, { PropTypes } from 'react'
import ReactList from 'react-list';
import ConnSummary from './ConnSummary';

class ConnSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
  }
  renderItem(index, key) {
    const conn_id = Object.keys(this.props.conns)[index];
    const conn = this.props.conns[conn_id];
    return <ConnSummary
             conn={conn}
             key={key}
             selected={conn_id === this.props.selectedConn}
             selectConn={() => this.props.selectConn(conn.assigns.id)}
             sendConn={() => this.props.sendConn(conn)}
           />;
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
ConnSidebar.propTypes = {
  selectedConn: PropTypes.string,
  selectConn: PropTypes.func.isRequired,
  conns: PropTypes.object.isRequired,
  sendConn: PropTypes.func.isRequired
}
export default ConnSidebar;
