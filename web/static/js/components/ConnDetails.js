import React from 'react';
import Response from './Response';
import Request from './Request';
// import moment from 'moment';

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

export default ConnDetails;
