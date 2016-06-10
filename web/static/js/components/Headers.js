import React, { PropTypes } from 'react'

const Headers = (props) => {
  return(
    <ol className="headers">
      {Object.keys(props.headers).map((name, index) => {
         return (
           <li key={index}>{name}: {props.headers[name]}</li>
         );
       })}
    </ol>
  );
}
Headers.propTypes = {
    // headers: PropTypes.array.isRequired
    headers: PropTypes.object.isRequired
}

export default Headers;
