import React, { PropTypes } from 'react'
import classNames from 'classnames';

const ConnSummary = ({conn, selected, selectConn, sendConn, deleteConn}) => {
  const classes = classNames({
    'is-selected': selected,
    'conn': true
  });
  const content_type = conn.resp_headers && conn.resp_headers['content-type']
  return(
    <div className={classes} onClick={selectConn}>
      <span className='method'>{conn.method}</span>
      <span className='path'>{conn.request_path}</span>
      <a className='action--resend' onClick={sendConn}><span className='glyphicon glyphicon-repeat'></span></a>
      <br/>
      <span className='status'>{conn.status}</span>
      <span>{content_type}</span>
      <a className='action--delete' onClick={deleteConn}><span className='glyphicon glyphicon-remove'></span></a>
    </div>
  );
}
ConnSummary.propTypes = {
  conn: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  selectConn: PropTypes.func.isRequired,
  sendConn: PropTypes.func.isRequired
}

export default ConnSummary;
