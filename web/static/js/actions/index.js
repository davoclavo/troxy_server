import * as types from '../constants/ActionTypes'

export function selectConn(conn_id) {
  // console.log("Conn selected: " + conn_id)
  return {
    type: types.SELECT_CONN,
    conn_id
  }
}

export function sendConn(conn) {
  console.warn("Request! " + conn.request_path)
  let xhr = new XMLHttpRequest()
  // Send request to window.location.origin and add x-troxy-host header
  let uri = new URL(window.location.origin)

  // TODO: Support this notation i.imgur.com.davo.io
  /* uri.host = conn.host + "." + uri.host */

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
                                 })

  xhr.open('GET', target_uri.href, true)
  xhr.setRequestHeader("X-Troxy-Host", conn.host)
  xhr.setRequestHeader("Cache-Control", "no-cache")
  xhr.setRequestHeader("Pragma", "no-cache")

  xhr.send()
  // console.log("Conn selected: " + conn_id)
  return {
    type: types.SEND_CONN,
    xhr
  }
}

export function deleteConn(conn_id) {
  // console.log("Conn deleted: " + conn_id)
  return {
    type: types.DELETE_CONN,
    conn_id
  }
}
