import * as actionTypes from './actionTypes';

export const initForm = (formValues) => {
  return {
    type: actionTypes.FORM_INIT,
    formValues: formValues
  };
}

export const updateForm = (formName, fieldName, fieldValues, formIsValid) => {
  return {
    type: actionTypes.FORM_UPDATE,
    formName: formName,
    fieldName: fieldName,
    fieldValues: fieldValues,
    formIsValid: formIsValid
  };
}

export const submitForm = (formName, submitted) => {
  return {
    type: actionTypes.FORM_SUBMIT,
    formName: formName,
    submitted: submitted
  }
}

export const deleteForm = (formName) => {
  return {
    type: actionTypes.FORM_DELETE,
    formName: formName
  }
}