import gql from 'graphql-tag'

export default gql`
  mutation createEmailSubsciber ($firstName: String!, $lastName: String!, $email: String!) {
    createEmailSubscriber(input: {emailSubscriber: {
      firstName: $firstName
      lastName: $lastName
      email: $email
    }}) {
      emailSubscriber {
        subId
        firstName
        lastName
        email
        createdOn
      }
    }
  }
`