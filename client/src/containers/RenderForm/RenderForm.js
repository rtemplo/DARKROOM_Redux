import React, { Component, Fragment } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
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
  state = {
    formName: '',
    formConfig: {},
    formIsValid: false,
    formElementsArray: [],
    formSubmitted: false
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

          return (
            <DynamicFormControl 
              key={formElement.id}
              id={formElement.id}
              elementType={formElement.config.elementType}
              labelText = {formElement.config.labelText}
              inputProps={formElement.config.elementConfig}
              value={this.state.formConfig[formElement.id].value}
              required={isRequired}
              errorMessage={errorMessage}
              invalid={!this.state.formConfig[formElement.id].valid}
              shouldValidate={formElement.config.validation}
              touched={this.state.formConfig[formElement.id].touched}
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
            disabled={!this.state.formIsValid} 
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
    const updatedFormConfig = {
      ...this.state.formConfig
    }
    /* 
      Because the spread operator above is a shallow copy, referencing sub objects 
      will still point to the original object which violates the immutibility principle.
      To get around this we spread the specific sub object below.
    */
    let updatedFormElement = {
      ...updatedFormConfig[inputIdentifier]
    }

    // Get the value for the specific control
    if (event.target !== undefined) {
    // Logic goes here everytime it's NOT a React Datetime control component
      if (event.target.dataset !== undefined && event.target.dataset.checkboxgroup !== undefined) {
        // Checkboxes are special, as they are individual controls but we want to bundle their values
        //  All the values from checkbox selections are stored in an array.
        //  We process that array here
        if (event.target.checked) {
          // If it's not already in the array add it.
          if (updatedFormElement.value.indexOf(event.target.value) < 0) {
            updatedFormElement.value.push(event.target.value)
          }
        } else {
          // Remove if it is in the array (previously checked/selected)
          updatedFormElement.value = updatedFormElement.value.filter(item => item !== event.target.value)
        }
      } else {
        updatedFormElement.value = event.target.value
      }
    } else {
    // It's React Datetime control value
    // This is a bit hacky but it works so I hijacked it when maybe I could have made a dedicated handler for datetime inputs
      //console.log(event._d instanceof Date)
      updatedFormElement.value = (event._d) ? event._d : event
    }

    // Validate the value of the specific field
    //  First we need to see if the field is a confirmation field that has to match the value of another field.
    if (updatedFormElement.validation.matches && updatedFormElement.validation.matches.field !== undefined) {
      const fieldNameForMatch = updatedFormElement.validation.matches.field
      const fieldToMatchValue = this.state.formConfig[fieldNameForMatch].value

      let updatedFormElement_deep = Immutable.fromJS(updatedFormElement)
      updatedFormElement_deep = updatedFormElement_deep.setIn(['validation', 'matches', 'value'], fieldToMatchValue)
      updatedFormElement = updatedFormElement_deep.toJS()
    }

    updatedFormElement.valid = checkValidity(updatedFormElement.value, updatedFormElement.validation)
    // Mark the value as touched. If they leave it empty and it is required this will enable the notification to appear that the field must be filled
    updatedFormElement.touched = true

    const fieldValues = [updatedFormElement.value, updatedFormElement.valid, updatedFormElement.touched]

    //Fold the modifications in the copied object back into its state copy
    updatedFormConfig[inputIdentifier] = updatedFormElement

    // Optimistically assuming that the form is complete, iterate through all the fields and verify if all fields are indeed valid.
    // If any field is found incomplete or wrongly inputted, the form will be marked invalid. This will eventually suppress submission
    //  since the submit button is disabled based on the formIsValid state value.
    let formIsValid = true;
    for (let inputIdentifier in updatedFormConfig) {
      if (updatedFormConfig[inputIdentifier].validation.required) {
        formIsValid = updatedFormConfig[inputIdentifier].valid && formIsValid
      }
    }

    /* 
    Up to this point in the logic we need to save data back to redux but the format is still transformed to lighter format redux uses.
    We will reconcile the data passed here to the structure in Redux using Immutable within the reducer file.
    */
    
    this.setState({formConfig: updatedFormConfig, formIsValid: formIsValid}, () => {
      this.props.onUpdate(this.state.formName, inputIdentifier, fieldValues, formIsValid)
    })
  } //END inputChangeHandler()

  onSubmit = (event, mutate, formData) => {
    event.preventDefault();

    this.setState({formSubmitted: true}, () => {
      // this.props.onSubmit(this.state.formName, true)
      
      // This mutation will trigger a page reload. Not ideal for SPA but that's how Apollo mutations work!
      mutate({variables: { ...formData }}).then(() => {
        this.props.onDelete(this.state.formName)
      }).finally(
        () => {
          const nextLocation = (this.props.redirectTo !== undefined && this.props.redirectTo !== '') ? this.props.location.pathname : this.props.redirectTo
          this.props.history.go(nextLocation)
        }
      )
    })
  }   

  onReset = () => {
    // let initResetValue = ''
    // const resetformValues = Object.keys(this.state.formConfig).reduce((acc, item) => {
    //   initResetValue = (this.state.formConfig[item].value instanceof Array)?[]:''
    //   acc[item] = [initResetValue, false, false]
    //   return acc
    // }, {})

    // const resetReduxFormState = {
    //   [this.state.formName]: {
    //     fields: resetformValues,
    //     isValid: false,
    //     submitted: false
    //   }
    // }

    // this.props.onInit(resetReduxFormState)
    this.props.onDelete(this.state.formName)
    this.props.history.go(this.props.location.pathname)
  }

  // This LC method is now deprecated
  componentWillMount = () => {
    if (this.props.debug) console.log("CWM", this.state.formConfig)
  }
 
  componentDidMount = () => {
    if (this.props.debug) console.log("CDM", this.props.formData)
    const formElementsArray = [];
    
    for (let key in this.props.config) {
      formElementsArray.push({
        id: key, 
        config: this.props.config[key] // get specific form input configuration via object literal expression extensions in ES6
      });
    }

    // Set default values
    let updatedFormConfig = this.props.config
    let formIsValid = false;
    let formSubmitted = false;

    // Check if there is preserved data in Redux, override defaults if found
    if (this.props.isInRedux) {
      formSubmitted = this.props.formData.submitted

      updatedFormConfig = {...this.props.config}
      let updatedFormField = null

      for (let fieldKey in this.props.formData.fields) {
        updatedFormField = {...updatedFormConfig[fieldKey]}
        updatedFormField.value = this.props.formData.fields[fieldKey][0]
        updatedFormField.valid = this.props.formData.fields[fieldKey][1]
        updatedFormField.touched = this.props.formData.fields[fieldKey][2]
        updatedFormConfig[fieldKey] = updatedFormField
      }

      formIsValid = this.props.formData.isValid
      formSubmitted = this.props.formData.submitted
    }

    // Load values to local state, local state is referenced by the user controls
    this.setState({
      formName:this.props.name, 
      formConfig: updatedFormConfig, 
      formElementsArray: formElementsArray,
      formIsValid: formIsValid,
      formSubmitted: formSubmitted
    }, () => {
      if (!this.props.isInRedux) {
        const formValues = Object.keys(this.state.formConfig).reduce((acc, item) => {
          acc[item] = [this.state.formConfig[item].value, this.state.formConfig[item].valid, this.state.formConfig[item].touched]
          return acc
        }, {})

        const newReduxFormState = {
          [this.state.formName]: {
            fields: formValues,
            isValid: this.state.formIsValid,
            submitted: this.state.formSubmitted
          }
        }

        // Send the object to Redux
        this.props.onInit(newReduxFormState)
      }
    })
  }

  //This is here for optimization in case this becomes a sub component of something more complex
  shouldComponentUpdate = (nextProps, nextState) => {
    if (nextProps!==this.props || nextState!==this.state) {
      return true
    } else {
      return false
    }
  }  
  
  componentWillUpdate = (nextProps, nextState) => {
    if (this.props.debug) console.log("CWU", this.props.formData)
  }
  
  componentDidUpdate = () => {
    if (this.props.debug) console.log("CDU", this.state.formSubmitted)
  }  

  styleClasses = null

  render() {
    this.styleClasses = this.props

    let redirectTo = null
    if (this.state.formSubmitted && this.props.redirectTo && this.props.redirectTo.trim() !== '') {
      redirectTo = <Redirect to={this.props.redirectTo} />
    }

    const isSubmitted = this.state.formSubmitted

    return (
      <Fragment>
        {redirectTo}

        <Mutation mutation={this.props.mutation}>
        {
          (mutate, {loading, error}) => {
            if (loading) return <Spinner />
            if (error) return this.modalAlert("Oops! An error has occurred.", error.message)
            if (!isSubmitted) {
              const formData = {}
              let postgrahileCompiantKeyname = null, formElement = null
              
              for (let formElementIdentifier in this.state.formConfig) {
                formElement = this.state.formConfig[formElementIdentifier]

                if (
                    (formElement.nosave === undefined || (formElement.nosave && !formElement.nosave)) 
                    && formElement.value !== ''
                    && formElement.value !== []
                ) {
                  postgrahileCompiantKeyname = camelizer(formElementIdentifier)
                  formData[postgrahileCompiantKeyname] = (formElement.value instanceof Array) ? formElement.value.join(',') : formElement.value
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
            } else {
              return null
            }
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