import React, { PropTypes } from 'react'
import Headers from './Headers';
import Body from './Body';

const Response = ({conn, more_body}) => {
  return(
    <div className='response'>
      <span className='status'>{conn.status}</span>
      <Headers className='resp_headers' headers={conn.resp_headers} />
      <Body className='resp_body' content_type={conn.resp_headers['content-type']} body={conn.resp_body} more_body={more_body}/>
      {/* TODO: Timing */}
      {/* TODO: SSL */}
      {/* TODO: Settings(follow_redirects?) */}
    </div>
  );
}
Response.propTypes = {
  conn: PropTypes.object.isRequired,
  more_body: PropTypes.bool
};


export default Response;
