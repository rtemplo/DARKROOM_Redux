import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import asyncComponent from '../../hoc/asyncComponent'

// Note: Depending on what kinds of controls you need on your form you may not need to import all of the below. Import accordingly.
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import Check from "@material-ui/icons/Check"
import Clear from "@material-ui/icons/Clear"
import Datetime from 'react-datetime' //cannot be loaded with asyncComponent
import moment from 'moment'

// nodejs library to set properties for components
// import PropTypes from "prop-types";
// nodejs library that concatenates classes
import classNames from "classnames"
import formInputStyle from "./DynamicFormControlStyle"

// NOTE: These commented out imports are converted loaded via asyncComponent for optimization 
// import FormControlLabel from "@material-ui/core/FormControlLabel"
// import Input from "@material-ui/core/Input"
// import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
// import FiberManualRecord from "@material-ui/icons/FiberManualRecord"
// import Checkbox from '@material-ui/core/Checkbox'
// import RadioGroup from '@material-ui/core/RadioGroup'
// import Radio from '@material-ui/core/Radio'

const AsyncFormControlLabel = asyncComponent(() => { return import('@material-ui/core/FormControlLabel'); });
const AsyncInput = asyncComponent(() => { return import('@material-ui/core/Input') })
const AsyncSelect = asyncComponent(() => { return import('@material-ui/core/Select') })
// const AsyncMenuItem = asyncComponent(() => { return import('@material-ui/core/MenuItem') })
const AsyncFiberManualRecord = asyncComponent(() => { return import('@material-ui/icons/FiberManualRecord') })
const AsyncCheckbox = asyncComponent(() => { return import('@material-ui/core/Checkbox') })
const AsyncRadioGroup = asyncComponent(() => { return import('@material-ui/core/RadioGroup') })
const AsyncRadio = asyncComponent(() => { return import('@material-ui/core/Radio') })

const formInput = (props) => {
  const {
    classes,
    id,
    elementType, 
    labelText,
    inputProps, 
    value, 
    required,
    errorMessage,
    invalid,
    shouldValidate,
    touched,
    changed,
    formControlProps,
    options,
    white,
    inputRootCustomClasses,
    labelProps
  } = props

  let inputElement = null;
  const error = (invalid && shouldValidate && touched) ? true : false;
  const success = !invalid  

  const labelClasses = classNames({
    [" " + classes.labelRootError]: error,
    [" " + classes.labelRootSuccess]: success && !error
  });

  const underlineClasses = classNames({
    [classes.underlineError]: error,
    [classes.underlineSuccess]: success && !error,
    [classes.underline]: true,
    [classes.whiteUnderline]: white
  });

  const marginTop = classNames({
    [inputRootCustomClasses]: inputRootCustomClasses !== undefined
  });

  const inputClasses = classNames({
    [classes.input]: true,
    [classes.whiteInput]: white
  });

  let formControlClasses;
  if (formControlProps !== undefined) {
    formControlClasses = classNames(
      formControlProps.className,
      classes.formControl
    );
  } else {
    formControlClasses = classes.formControl;
  }

  let feedbackClasses = classes.feedback;
  if (inputProps !== undefined) {
    if (inputProps.endAdornment !== undefined) {
      feedbackClasses = feedbackClasses + " " + classes.feedbackRight;
    }
  }

  // ########## Currently a let so it can be overriden for radio but this is hacky, needs refactor
  // The other label is meant for text boxes and runs into these controls, unless maybe top padding is set???
  let inputLabel = (labelText !== undefined) ? (
    <InputLabel
      className={classes.labelRoot + " " + labelClasses}
      htmlFor={id}
      {...labelProps}
    >
      { (required) ? labelText + ' *' : labelText }
    </InputLabel>
  ) : null

  // ###########Needs a ternary here to return a Null value if the control is a drop down
  const inputConfirmation = error ? (
    <Clear className={feedbackClasses + " " + classes.labelRootError} />
  ) : success ? (
    <Check className={feedbackClasses + " " + classes.labelRootSuccess} />
  ) : null

  switch (elementType) {
    case ('smalltext'):
      inputElement = (
        <div className={classes.Input}>
          <FormControl {...formControlProps} className={formControlClasses}>
            {inputLabel}
            <AsyncInput
              classes={{
                input: inputClasses,
                root: marginTop,
                disabled: classes.disabled,
                underline: underlineClasses
              }}
              id={id}
              value={value}
              onChange={changed}
              inputProps={inputProps}
            />
            {inputConfirmation}
          </FormControl>
        </div>
      )        
      break;
    case ('largetext'):
      inputElement = (
        <div className={classes.Input}>
          <FormControl {...formControlProps} className={formControlClasses}>    
            {inputLabel}    
            <AsyncInput
              multiline
              classes={{
                input: inputClasses,
                root: marginTop,
                disabled: classes.disabled,
                underline: underlineClasses
              }}
              id={id}
              value={value}
              onChange={changed}
              inputProps={inputProps}
            />
            {inputConfirmation}
          </FormControl>
        </div>
      )        
      break;      
    case ('list'):
      inputElement = (
        <FormControl fullWidth className={classes.selectFormControl}>
          {inputLabel}
          <AsyncSelect
            multiple={inputProps.multiple}
            value={value}
            onChange={changed}
            inputProps={{name: "n_" + id, id: id}}
            classes={{select: classes.select}}
            MenuProps={{className: classes.selectMenu}}
          >
            <MenuItem
              disabled
              classes={{root: classes.selectMenuItem}}
            >
              {inputProps.placeholder}
            </MenuItem>        
            {(options !== undefined && options instanceof Array) ? options.map((option, i) => {
              return (
                <MenuItem key={i}
                  classes={{
                    root: classes.selectMenuItem,
                    selected: classes.selectMenuItemSelected
                  }}
                  value={option.value}>
                  {option.text}
                </MenuItem>
              )
            }) : null}
          </AsyncSelect>          
        </FormControl>
      )
      break;
    case ('radio'):
      inputElement = (
        <div className={classes.checkboxAndRadio}>
          {inputLabel}
          <AsyncRadioGroup
            aria-label={labelText}
            name={id}
            className={classes.group}
            value={value}
            onChange={changed}
          >
            {(options !== undefined && options instanceof Array) ? options.map((option, i) => {
              return (
                <AsyncFormControlLabel 
                  key={i} 
                  value={option.value} 
                  control={
                    <AsyncRadio 
                      checked={value===option.value} 
                      checkedIcon={<AsyncFiberManualRecord className={classes.radioChecked} />}
                      icon={<AsyncFiberManualRecord className={classes.radioUnchecked} />}
                      classes={{checked: classes.radio}}
                    />
                  } 
                  classes={{label: classes.label}}
                  label={option.text} 
                />
              )
            }): null }
          </AsyncRadioGroup>
        </div>
      )
      break;
    case ('checkbox'): 
      inputElement = (
          <div className={classes.inlineChecks}> 
            <div>{inputLabel}</div>
          {
            (options !== undefined && options instanceof Array) ? options.map((option, i) => (
            <AsyncFormControlLabel
              key={"ro_" + i}
              control={
                <AsyncCheckbox
                  checked={value.indexOf(option.value) > -1}
                  checkedIcon={<Check className={classes.checkedIcon} />}
                  icon={<Check className={classes.uncheckedIcon} />}
                  onChange={changed}
                  value={option.value}
                  inputProps={{name: id, ...inputProps}}
                  classes={{checked: classes.checked}}
                />
              }
              classes={{label: classes.label}}
              label={option.text}
            />
            )) : null
          }
          </div>
      )
      break;
    case ('date'): 
      const dateVal = (value)?moment(value).format('MM-DD-YYYY'):null
      inputElement = (
        <div className={classes.datetimeFormControl + " " + classes.dateTimeField}>
          {inputLabel}        
          <FormControl fullWidth>
            <Datetime
              timeFormat={false}
              dateFormat="MM-DD-YYYY"
              inputProps={{ placeholder: inputProps.placeholder, readOnly: true }}
              value={dateVal}
              onChange={changed}
              closeOnSelect={true}
            />
            {inputConfirmation}
          </FormControl>
        </div>
      )
      break;
    case ('time'):
      const timeVal = (value) ? moment(value).format('LT'):null
      inputElement = (
        <div className={classes.datetimeFormControl + " " + classes.dateTimeField}>
          {inputLabel}
          <FormControl fullWidth>
            <Datetime
              dateFormat={false}
              inputProps={{ placeholder: inputProps.placeholder, readOnly: true }}
              value={timeVal}
              onChange={changed}          
            />
            {inputConfirmation}
          </FormControl>
        </div>
      )
      break;
    case ('datetime'):
      const dateTimeVal = (value) ? moment(value).format('L LT'):null
      inputElement = (
        <div className={classes.datetimeFormControl + " " + classes.dateTimeField}>
          {inputLabel}        
          <FormControl fullWidth>
            <Datetime
              inputProps={{ placeholder: inputProps.placeholder, readOnly: true }}
              value={dateTimeVal}
              onChange={changed}       
            />
            {inputConfirmation}
          </FormControl>
        </div>
      )
      break;    
    default:
      inputElement = (
        <AsyncInput
          classes={{
            input: inputClasses,
            root: marginTop,
            disabled: classes.disabled,
            underline: underlineClasses
          }}
          id={id}
          value={value}
          inputProps={{placeholder: Error}}
        />
      )        
      break;
  }

  let validationError = null;
  if (invalid && touched && errorMessage) {
    validationError = <p className={classes.ValidationError}>{errorMessage}</p>;
  }

  return (
    <React.Fragment>
      <div>
        {inputElement}
      </div>      
      {validationError}
    </React.Fragment>
  )
}

export default withStyles(formInputStyle)(formInput);