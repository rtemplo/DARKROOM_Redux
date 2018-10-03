import * as actionTypes from '../actions/actionTypes'
import Immutable from 'immutable'

const initialState = {}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FORM_INIT:
      return {...state, ...action.formValues}
    case actionTypes.FORM_UPDATE:
      let newState = Immutable.fromJS(state)
      let newState2 = newState.setIn([action.formName, 'isValid'], action.formIsValid)
      let newState3 = newState2.setIn([action.formName, 'fields', action.fieldName], action.fieldValues)
      return newState3.toJS()
    case actionTypes.FORM_SUBMIT:
      let submitState = Immutable.fromJS(state)
      let submitState2 = submitState.setIn([action.formName, 'submitted'], action.submitted)
      return submitState2.toJS()
    case actionTypes.FORM_DELETE:
      const cleanedState = Immutable.fromJS(state).delete(action.formName).toJS()
      return cleanedState
    default:
      return state
  }
}

export default reducer