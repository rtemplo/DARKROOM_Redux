import gql from 'graphql-tag'

export default gql`
  mutation createDemoForm(
    $firstName: String,
    $lastName: String,
    $password: String,
    $comment: String,
    $singleSelection: String,
    $multipleSelection: String,
    $radioSelection: String,
    $checkboxSelection: String,
    $dateEntry: Datetime,
    $timeEntry: Datetime,
    $datetimeEntry: Datetime
  ) {
    createDemoForm(input: {demoForm: {
      firstName: $firstName
      lastName: $lastName
      password: $password
      comment: $comment
      singleSelection: $singleSelection
      multipleSelection: $multipleSelection
      radioSelection: $radioSelection
      checkboxSelection: $checkboxSelection
      dateEntry: $dateEntry
      timeEntry: $timeEntry
      datetimeEntry: $datetimeEntry
    }}) {
      demoForm {
        demoId
      }
    }
  }
`