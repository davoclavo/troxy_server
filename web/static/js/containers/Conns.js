import { connect } from 'react-redux'
import { selectConn, addConn, updateConn, sendConn } from '../actions'
import ConnView from '../components/ConnView'

const mapStateToProps = (state) => {
  return state.davo
}

const mapDispatchToProps = (dispatch) => {
  return {
    addConn: (conn) => {
      dispatch(addConn(conn))
    },
    updateConn: (conn) => {
      dispatch(updateConn(conn))
    },
    selectConn: (id) => {
      dispatch(selectConn(id))
    },
    sendConn: (conn) => {
      dispatch(sendConn(conn))
    }
  }
}

const Conns = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnView)

export default Conns
