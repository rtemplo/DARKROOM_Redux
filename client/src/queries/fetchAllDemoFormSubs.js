import gql from 'graphql-tag'

export default gql`
  query allDemoFormSubs($first: Int, $offset: Int, $orderBy:[DemoFormPublicsOrderBy!]) {
    allDemoFormPublics(first: $first, offset: $offset, orderBy:$orderBy) {
      nodes {
        username
        firstName
        lastName
        email
        singleSelection
        multipleSelection
        radioSelection
        checkboxSelection
        dateEntry
        timeEntry
      }
    }
  }
`