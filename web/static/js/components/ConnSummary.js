import React, { PropTypes } from 'react'
import classNames from 'classnames';

const ConnSummary = ({selected, selectConn, conn, sendConn}) => {
  const classes = classNames({
    'is-selected': selected,
    'conn': true
  });
  return(
    <div className={classes} onClick={selectConn}>
      <span className='method'>{conn.method}</span>
      <span className='path'>{conn.request_path}</span>
      <a className='action--resend' onClick={sendConn}><span className='glyphicon glyphicon-repeat'></span></a>
      <br/>
      <span className='status'>{conn.status}</span>
      <span>{conn.resp_headers['content-type']}</span>
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
