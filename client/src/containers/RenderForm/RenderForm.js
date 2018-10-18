import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import Immutable from 'immutable'
import PropTypes from 'prop-types'
import withStyles from "@material-ui/core/styles/withStyles"
import { connect } from 'react-redux'
import * as actions from '../../store/actions/index'
import { Mutation } from 'react-apollo'
import DynamicFormControl from '../../containers/DynamicFormControl/DynamicFormControl'
import { checkValidity } from '../../shared/validation'
import { camelizer } from '../../shared/camelizer'

import SweetAlert from "react-bootstrap-sweetalert"
import Spinner from '../../components/Spinner/Spinner'
import Button from '../../components/CustomButtons/Button'
import renderFormStyle from './RenderFormStyle.jsx'

class RenderForm extends Component {
  constructor(props) {
    super(props)

    let formIsValid = false
    let formConfig = this.props.config
    const formElementsArray = []
    
    for (let key in this.props.config) {
      formElementsArray.push({
        id: key, 
        config: this.props.config[key] // get specific form input configuration via object literal expression extensions in ES6
      });
    }    
    
    if (this.props.isInRedux) { // If data is in Redux store use it
      formConfig = {...this.props.config}
      let updatedFormField = null

      for (let fieldKey in this.props.formData.fields) {
        updatedFormField = {...formConfig[fieldKey]}
        updatedFormField.value = this.props.formData.fields[fieldKey][0]
        updatedFormField.valid = this.props.formData.fields[fieldKey][1]
        updatedFormField.touched = this.props.formData.fields[fieldKey][2]
        formConfig[fieldKey] = updatedFormField
      }

      formIsValid = this.props.formData.isValid
    } else { // Init data in Redux store
      const formValues = Object.keys(formConfig).reduce((acc, item) => {
        acc[item] = [formConfig[item].value, formConfig[item].valid, formConfig[item].touched]
        return acc
      }, {})

      const newReduxFormState = {
        [this.props.name]: {
          fields: formValues,
          isValid: formIsValid
        }
      }

      // Send the object to Redux
      this.props.onInit(newReduxFormState)      
    }

    this.state = {
      formName: this.props.name,
      formConfig,
      formIsValid,
      formElementsArray
    }
  }

  modalAlert = (title, message) => (
    <SweetAlert
      style={{ display: "block", marginTop: "-100px" }}
      title={title}
      onConfirm={() => this.props.history.go(this.props.location.pathname)}
      onCancel={() => this.props.history.go(this.props.location.pathname)}
      confirmBtnCssClass={
        this.props.classes.button + " " + this.props.classes.success
      }
    >
      {message}
    </SweetAlert>  
  )  

  composeFormControls = (child) => {
    if (child.props.rf_layoutid !== 'rf_button_layer') {
      return this.state.formElementsArray.map(formElement => {
        if (formElement.config.container && formElement.config.container === child.props.rf_layoutid) {
          const errorMessage = (formElement.config.validation && formElement.config.validation.errorMessage) ? formElement.config.validation.errorMessage : "Your input for this field is invalid"
          const isRequired = (formElement.config.validation && formElement.config.validation.required) ? true : false
          const inputValue = (this.props.formData && this.props.formData.fields && this.props.formData.fields[formElement.id]) ? this.props.formData.fields[formElement.id][0] : formElement.config.value
          const inputValid = (this.props.formData && this.props.formData.fields && this.props.formData.fields[formElement.id]) ? this.props.formData.fields[formElement.id][1] : formElement.config.valid
          const inputTouched = (this.props.formData && this.props.formData.fields && this.props.formData.fields[formElement.id]) ? this.props.formData.fields[formElement.id][2] : formElement.config.touched

          return (
            <DynamicFormControl 
              key={formElement.id}
              id={formElement.id}
              elementType={formElement.config.elementType}
              labelText = {formElement.config.labelText}
              inputProps={formElement.config.elementConfig}
              value={inputValue}
              required={isRequired}
              errorMessage={errorMessage}
              invalid={!inputValid}
              shouldValidate={formElement.config.validation}
              touched={inputTouched}
              changed={(event) => this.inputChangedHandler(event, formElement.id)}
              formControlProps={{fullWidth: true}}
              options={formElement.config.options}
            />
          )
        } else {
          return null
        }
      })
    } else {
      return (
        <Fragment>
          <Button 
            color="rose" 
            onClick={this.onReset} 
            disabled={false} 
            className={this.styleClasses.registerButton}
          >Reset
          </Button>          
          <Button 
            color="rose" 
            type="submit"
            disabled={this.props.formData && !this.props.formData.isValid} 
            className={this.styleClasses.registerButton}
          >Submit
          </Button>  
        </Fragment>
      )
    }
  }

  getFormControls = (child) => {
    return React.cloneElement(
      child, 
      { children: this.composeFormControls(child) }
    )
  }

  populateContainers = (children, fn) => {
    // Start iteration over the top level children
    return React.Children.map(children, child => {
      // Return the child for immediately to render if the child is not a node (i.e. a render prop function)
      if (!React.isValidElement(child)) return child

      if (child.props.rf_layoutid) {
        return fn(child)
      }
  
      if (child.props.children) {
        child = React.cloneElement(child, {
          children: this.populateContainers(child.props.children, fn)
        })
      }

      return child
    });
  }

  inputChangedHandler = (event, inputIdentifier) => {
    let formControl = this.state.formConfig[inputIdentifier]
    // let { value, valid, touched } = formControl
    let value = this.props.formData.fields[inputIdentifier][0]
    let valid = this.props.formData.fields[inputIdentifier][1]
    let touched = this.props.formData.fields[inputIdentifier][2]

    // Get the value for the specific control
    if (event.target !== undefined) {
    // Logic goes here everytime it's NOT a React Datetime control component
      if (event.target.dataset && event.target.dataset.checkboxgroup) {
        // Checkboxes are special, as they are individual controls but we want to bundle their values
        //  All the values from checkbox selections are stored in an array.
        //  We process that array here
        if (event.target.checked) {
          // If it's not already in the array add it.
          if (value.indexOf(event.target.value) < 0) {
            value.push(event.target.value)
          }
        } else {
          // Remove if it is in the array (previously checked/selected)
          value = [...value.filter(item => item !== event.target.value)]
        }
      } else {
        value = event.target.value
      }
    } else {
    // It's React Datetime control value
    // This is a bit hacky but it works so I hijacked it when maybe I could have made a dedicated handler for datetime inputs
      //console.log(event._d instanceof Date)
      value = (event._d) ? event._d : event
    }

    // Validate the value of the specific field
    //  First we need to see if the field is a confirmation field that has to match the value of another field.
    if (formControl.validation.matches && formControl.validation.matches.field !== undefined) {
      const fieldNameForMatch = formControl.validation.matches.field
      const fieldToMatchValue = this.state.formConfig[fieldNameForMatch].value

      let updatedFormElement_deep = Immutable.fromJS(formControl)
      updatedFormElement_deep = updatedFormElement_deep.setIn(['validation', 'matches', 'value'], fieldToMatchValue)
      formControl = updatedFormElement_deep.toJS()
    }

    valid = checkValidity(value, formControl.validation)
    // Mark the value as touched. If they leave it empty and it is required this will enable the notification to appear that the field must be filled
    touched = true

    const fieldValues = [value, valid, touched]

    // Optimistically assuming that the form is complete, iterate through all the fields and verify if all fields are indeed valid.
    // If any field is found incomplete or wrongly inputted, the form will be marked invalid. This will eventually suppress submission
    //  since the submit button is disabled based on the formIsValid state value.
    let formIsValid = true;
    for (let controlName in this.state.formConfig) {
      if (this.state.formConfig[controlName].validation.required) {
        if (controlName !== inputIdentifier) {
          formIsValid = this.props.formData.fields[controlName][1] && formIsValid
        } else {
          formIsValid = valid && formIsValid
        }
      }
    }

    /* 
    Up to this point in the logic we need to save data back to redux but the format is still transformed to lighter format redux uses.
    We will reconcile the data passed here to the structure in Redux using Immutable within the reducer file.
    */
    this.props.onUpdate(this.state.formName, inputIdentifier, fieldValues, formIsValid)
  } //END inputChangeHandler()

  onSubmit = (event, mutate, formData) => {
    event.preventDefault();

    // This mutation will trigger a page reload. Not ideal for SPA but that's how Apollo mutations work!
    mutate({variables: { ...formData }}).then(() => {
      this.props.onDelete(this.state.formName)
    }).finally(
      () => {
        const nextLocation = (this.props.redirectTo !== undefined && this.props.redirectTo !== '') ? this.props.location.pathname : this.props.redirectTo
        this.props.history.go(nextLocation)
      }
    )
  }   

  onReset = () => {
    let initResetValue = ''
    const resetformValues = Object.keys(this.state.formConfig).reduce((acc, item) => {
      initResetValue = (this.state.formConfig[item].value instanceof Array)?[]:''
      acc[item] = [initResetValue, false, false]
      return acc
    }, {})

    const resetReduxFormState = {
      [this.state.formName]: {
        fields: resetformValues,
        isValid: false,
        submitted: false
      }
    }

    this.props.onInit(resetReduxFormState)
    // this.props.onDelete(this.state.formName)
    // this.props.history.go(this.props.location.pathname)
  }

  //This is here for optimization in case this becomes a sub component of something more complex
  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextProps!==this.props || nextState!==this.state) {
      return true
    } else {
      return false
    }
  }  
  
  componentDidUpdate = () => {
    if (this.props.debug) console.log("CDU")
  }  

  styleClasses = null

  render() {
    this.styleClasses = this.props

    return (
      <Fragment>
        <Mutation mutation={this.props.mutation}>
        {
          (mutate, {loading, error}) => {
            if (loading) return <Spinner />
            if (error) return this.modalAlert("Oops! An error has occurred.", error.message)

            const formData = {}
            let postgrahileCompliantKeyname = null, formElement = null, formElementValue = null
            
            for (let formElementIdentifier in this.state.formConfig) {
              formElement = this.state.formConfig[formElementIdentifier]
              formElementValue = this.props.formData.fields[formElementIdentifier][0]

              if (
                  (formElement.nosave === undefined || (formElement.nosave && formElement.nosave === false)) 
                  && formElementValue !== ''
                  && formElementValue !== []
              ) {
                postgrahileCompliantKeyname = camelizer(formElementIdentifier)
                formData[postgrahileCompliantKeyname] = (formElementValue instanceof Array) ? formElementValue.join(',') : formElementValue
              }
            }   

            return (
              <form 
                onSubmit={(e) => {this.onSubmit(e, mutate, formData)}}
              >
                {(this.state.formConfig) ? 
                  this.populateContainers(this.props.children, this.getFormControls) : null
                }
              </form>
            )
          }
        }
        </Mutation>
      </Fragment>
    )
  }
}

const mapStateToProps = (state, props) => {
  return {
    isInRedux: state.dynamicForm[props.name] !== undefined,
    formData: state.dynamicForm[props.name]
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onInit: (formValues) => dispatch(actions.initForm(formValues)),
    onUpdate: (formName, fieldName, fieldValues, formIsValid) => dispatch(actions.updateForm(formName, fieldName, fieldValues, formIsValid)),
    onSubmit: (formName, submitted) => dispatch(actions.submitForm(formName, submitted)),
    onDelete: (formName) => dispatch(actions.deleteForm(formName))
  }
}

RenderForm.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  mutation: PropTypes.object.isRequired,
  redirectTo: PropTypes.string,
  addAuthIdOnSave: PropTypes.bool,
  showReset: PropTypes.bool,
  debug: PropTypes.bool
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(renderFormStyle)(RenderForm)))