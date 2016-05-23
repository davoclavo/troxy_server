const initialState = {
  conns: {},
  ui: {
    selectedConn: null
  }
}

const davo = (state = initialState, action) => {
  switch (action.type) {
  case 'SELECT_CONN':
    return {
      ...state,
      ui: {...state.ui, selectedConn: action.conn_id }
    }
  case 'ADD_CONN':
  case 'UPDATE_CONN':
    const conn_id = action.conn.assigns.id
    return {
      ...state,
      conns: {
        ...state.conns,
        [conn_id]: action.conn
      }
    }
  case 'SEND_CONN':
  default:
    return state
  }
}

export default davo
