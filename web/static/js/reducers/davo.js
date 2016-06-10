import * as types from '../constants/ActionTypes'

const initialState = {
  conns: {},
  ui: {
    selected_conn_id: null
  }
}

export default function davo(state = initialState, action) {
  switch (action.type) {
    case types.SELECT_CONN:
      return {
        ...state,
        ui: {...state.ui, selected_conn_id: action.conn_id }
      }
    case types.ADD_CONN:
      var { conn_id, changeset } = action
      const { scheme, host, port, method, request_path, query_string, assigns, req_headers } = changeset
      const connDiff = { scheme, host, port, method, request_path, query_string, assigns, req_headers }
      return {
        ...state,
        conns: {
          ...state.conns,
          [conn_id]: connDiff
        }
      }
    case types.CHUNK_BODY_CONN:
      var { conn_id, changeset } = action
      const { body_chunk, more_body, body_type } = changeset
      var conn = state.conns[conn_id]
      var connDiff = { [body_type]: (conn[body_type] || "") + body_chunk,
                         more_body
                       }
      return {
        ...state,
        conns: {
          ...state.conns,
          [conn_id]: {...conn, ...connDiff}
        }
      }
    case types.ADD_RESP_CONN:
        var { conn_id, changeset } = action
        const { status, resp_headers } = changeset
        var conn = state.conns[conn_id]
        var connDiff = { status, resp_headers }
        return {
          ...state,
          conns:{
            ...state.conns,
            [conn_id]: {...conn, ...connDiff}
          }
        }
    case types.DELETE_CONN:
      delete state.conns[action.conn_id]
      return {
        ...state,
        conns: state.conns
      }
    case types.SEND_CONN:
    default:
      return state
  }
}
