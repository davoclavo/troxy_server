import React, { PropTypes } from 'react';
import Headers from './Headers';
import Body from './Body';

const Request = ({conn, more_body}) => {
  return(
    <div className='request'>
      <span className='method'>{conn.method}</span>
      <span className='host'>{conn.host}</span>:<span className='port'>{conn.port}</span>
      <span className='path'>{conn.request_path}</span>

      <span className='query_string'>{conn.query_string}</span>
      <Headers className='req_headers'
        headers={conn.req_headers}
      />
      <Body className='req_body'
        content_type={conn.req_headers['content-type']}
        body={conn.req_body}
        more_body={more_body}
      />
    </div>
  );
}
Request.propTypes = {
  conn: PropTypes.object.isRequired,
  more_body: PropTypes.bool
}

export default Request;
