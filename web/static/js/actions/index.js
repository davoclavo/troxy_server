export const selectConn = (conn_id) => {
  // console.log("Conn selected: " + conn_id)
  return {
    type: 'SELECT_CONN',
    conn_id
  }
}

export const sendConn = (conn) => {
  console.warn("Request! " + conn.request_path);
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
  // console.log("Conn selected: " + conn_id)
  return {
    type: 'SEND_CONN',
    xhr
  }
}

export const addConn = (conn) => {
  // console.log("Conn added: " + conn.assigns.id)
  return {
    type: 'ADD_CONN',
    conn
  }
}

export const updateConn = (conn) => {
  // console.log("Conn updated: " + conn.assigns.id)
  return {
    type: 'UPDATE_CONN',
    conn
  }
}
