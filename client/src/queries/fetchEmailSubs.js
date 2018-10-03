import gql from 'graphql-tag'

export default gql`
  query emailSubs {
    allEmailSubscribers(orderBy:LAST_NAME_ASC) {
      nodes {
        nodeId
        subId
        firstName
        lastName
        email
        createdOn
        lastUpdatedOn
      }
    }
  }
`