import React, { PropTypes } from 'react'
import Response from './Response';
import Request from './Request';
// import moment from 'moment';

const ConnDetails = ({conn}) => {
  if(conn == null) {
    return <marquee><blink>set your proxy to localhost:4000</blink></marquee>;
  } else {
    return (
      <div className='details'>
        <Request conn={conn} />
        <Response conn={conn} />
      </div>
    );
  }
}
ConnDetails.propTypes = {
  conn: PropTypes.object
}

export default ConnDetails;
