import gql from 'graphql-tag'

export default gql`
  mutation createDemoFormPublic(
    $firstName: String,
    $lastName: String,
    $username: String,
    $email: String,
    $password: String,
    $singleSelection: String,
    $multipleSelection: String,
    $comment: String,
    $radioSelection: String,
    $checkboxSelection: String,
    $dateEntry: Datetime,
    $timeEntry: Datetime,
    $datetimeEntry: Datetime
  ) {
    createDemoFormPublic(input: {demoFormPublic: {
      firstName: $firstName
      lastName: $lastName
      username: $username
      email: $email
      password: $password
      singleSelection: $singleSelection
      multipleSelection: $multipleSelection
      comment: $comment
      radioSelection: $radioSelection
      checkboxSelection: $checkboxSelection
      dateEntry: $dateEntry
      timeEntry: $timeEntry
      datetimeEntry: $datetimeEntry
    }}) {
			demoFormPublic {
        demoId
      }
    }
  }
`