import React from 'react'
import mutation from '../../queries/createDemoFormPublic'

import RenderForm from '../../components/RenderForm/RenderForm'
import GridContainer from '../../components/Grid/GridContainer'
import GridItem from '../../components/Grid/GridItem'
import Card from '../../components/Card/Card'
import CardBody from '../../components/Card/CardBody'

// Add Captcha
// When there is a match conformation that field should add a dependencies object to the field it needs to match

/*
NOTE: 
JSON data will be auto generated in the future.
If the data fields are pre-popuated with information the valid and touched fields must both be set to true

For acceptable properties for validation see: /src/shared/validation

*/

const TestForm = (props) => {
  const formName = 'DynamicFormDemo'
  const formConfig = {
    first_name: {
      elementType: 'smalltext',
      labelText: 'First Name',
      elementConfig: {
        type: 'text',
        placeholder: 'First Name'
      },
      value: '',
      validation: {
        minLength: 1,
        maxLength: 20,
        required: true,
        errorMessage: 'Please enter your first name.'
      },
      valid: false,
      touched: false,
      container: "gd1"     
    },
    last_name: {
      elementType: 'smalltext',
      labelText: 'Last Name',
      elementConfig: {
        type: 'text',
        placeholder: 'Last Name'
      },
      value: '',
      validation: {
        minLength: 1,
        maxLength: 20,
        required: true,
        errorMessage: 'Please enter your last name.'
      },
      valid: false,
      touched: false,
      container: "gd1"
    },
    username: {
      elementType: 'smalltext',
      labelText: 'Username',
      elementConfig: {
        type: 'text',
        placeholder: 'Username must have at least 8 characters with one number and one letter'
      },
      value: '',
      validation: {
        regex: 'type1',
        required: true,
        errorMessage: 'Please enter a username with at least 8 characters with one number and one letter.'
      },
      valid: false,
      touched: false,
      container: "gd1"
    },
    email: {
      elementType: 'smalltext',
      labelText: 'Email',
      elementConfig: {
        type: 'text',
        placeholder: 'Email Address'
      },
      value: '',
      validation: {
        isEmail:true,
        required: true,
        errorMessage: 'Please enter a valid email address.'
      },
      valid: false,
      touched: false,
      container: "gd1" 
    },
    password: {
      elementType: 'smalltext',
      labelText: 'Password',
      elementConfig: {
        type: 'password',
        placeholder: 'Minimum eight characters, at least one letter, one number and one special character'
      },
      value: '',
      validation: {
        maxLength: 25,
        regex: 'type2',
        required: false,
        errorMessage: 'The password must have a minimum eight characters, at least one letter, one number and one special character'
      },
      valid: false,
      touched: false,
      container: "gd1"      
    },      
    confirm_password: {
      elementType: 'smalltext',
      labelText: 'Confirm Password',
      elementConfig: {
        type: 'password',
        placeholder: 'Please re-type your password to confirm'
      },
      value: '',
      validation: {
        maxLength: 25,
        required: false,
        matches: {
          field: 'password',
          value: ''
        },
        errorMessage: 'Sorry the passwords you entered do not match'
      },
      valid: false,
      touched: false,
      nosave: true, // this property marks this object to become a control that does not save data; only to render to help other controls  
      container: "gd1"
    },      
    single_selection: {
      elementType: 'list',
      labelText: 'Primary Color',
      elementConfig: {
        multiple: false,
        placeholder: 'Pick one primary color'
      },
      value: '',
      options: [
        {value: "red", text: "red"},
        {value: "yellow", text: "yellow"},
        {value: "blue", text: "blue"}
      ],
      validation: {
        required: true,
        errorMessage: 'Please select a primary color.'
      },
      valid: false,
      touched: false,
      container: "gd2" 
    },
    // Note that this is the same elementType (list) as single selection,
    // The only difference is that multiple is specified as true and the value MUST initially be set as an array []
    multiple_selection: {
      elementType: 'list',
      labelText: 'Secondary Color',
      elementConfig: {
        multiple: true,
        placeholder: 'Pick at least one secondary color'
      },
      value: [],
      options: [
        {value: "green", text: "green"},
        {value: "orange", text: "orange"},
        {value: "purple", text: "purple"}
      ],
      validation: {
        required: true,
        errorMessage: 'Please select at least one secondary color.'
      },
      valid: false,
      touched: false,
      container: "gd2" 
    },
    comment: {
      elementType: 'largetext',
      labelText: 'Comment',
      elementConfig: {
        rows: 4,
        cols: 50,
        placeholder: 'Please leave a comment'
      },
      value: '',
      validation: {
        required: false,
        maxLength: 500,
        errorMessage: 'Please enter in a comment. (500 character limit)'
      },
      valid: false,
      touched: false,
      container: "gd2"
    },    
    radio_selection: {
      elementType: 'radio',
      labelText: 'Pick your favorite DC super hero.',
      options: [
        {value: "superman", text: "Superman"},
        {value: "wonder woman", text: "Wonder Woman"},
        {value: "batman", text: "Batman"},
        {value: "aqua man", text: "Aqua Man"}
      ],
      value: '',
      validation: {
        required: true,
        errorMessage: 'Please pick your favorite super hero.'
      },
      valid: false,
      touched: false,
      container: "gd3"      
    },
    checkbox_selection: {
      elementType: 'checkbox',
      labelText: 'Pick at least one Marvel super hero.',
      elementConfig: {
        'data-checkboxgroup': true
      },
      options: [
        {value: "iron man", text: "Iron Man"},
        {value: "captain america", text: "Captain America"},
        {value: "hulk", text: "The Hulk"},
        {value: "thor", text: "Thor"}
      ],
      value: [],
      validation: {
        required: true,
        errorMessage: 'Please pick your favorite super hero.'
      },
      valid: false,
      touched: false,
      container: "gd3"   
    },
    date_entry: {
      elementType: 'date',
      labelText: 'Set a date',
      elementConfig: {
        placeholder: 'Click to open calendar'
      },        
      value: '',
      validation: {
        required: false,
        errorMessage: 'Please select a date.'
      },
      valid: false,
      touched: false,
      container: "gd3" 
    },
    time_entry: {
      elementType: 'time',
      labelText: 'Set a time',
      elementConfig: {
        placeholder: 'Click to open time selector'
      },          
      value: '',
      validation: {
        required: false,
        errorMessage: 'Please select a time.'
      },
      valid: false,
      touched: false,
      container: "gd2" 
    },
    datetime_entry: {
      elementType: 'datetime',
      labelText: 'Set a Date and Time',
      elementConfig: {
        placeholder: 'Click to open calendar and time'
      },          
      value: '',
      validation: {
        required: false,
        errorMessage: 'Please select a date and time.'
      },
      valid: false,
      touched: false,
      container: "gd2" 
    }
  }

  let style = {
    padding: "0px 15px 0px 15px"
  }  

  return (
    <RenderForm 
      name={formName} 
      config={formConfig} 
      mutation={mutation}
      addAuthIdOnSave={true}
      showReset={true}
      debug={true} 
    >
      <div style={style}>
        <GridContainer>
          <GridItem xs={12} sm={12} md={4}>
            <Card>
              <CardBody rf_layoutid="gd1">
              I am Card #
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card>
              <CardBody rf_layoutid="gd2">
              I am Card #2
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <Card>
              <CardBody rf_layoutid="gd3">
              I am Card #3
              </CardBody>
            </Card>
          </GridItem>        
        </GridContainer>
        <GridContainer>
          <GridItem xs={12}>
            <GridContainer
              direction="row"
              alignItems="center"
              justify="center"
            >
              <GridItem>
                <div rf_layoutid="rf_button_layer"></div>
              </GridItem>
            </GridContainer>
            
          </GridItem>
        </GridContainer>
      </div>
    </RenderForm>
  )
}

export default TestForm;