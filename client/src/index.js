import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

// Redux Requirements
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import dynamicFormReducer from './store/reducers/dynamicForm'
// import reduxImmutableStateInvariant from 'redux-immutable-state-invariant'

// Apollo Requirements
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-client-preset'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

import { AUTH_TOKEN } from './shared/constants'

import './index.css'

// Redux Configuration
const rootReducer = combineReducers({
  dynamicForm: dynamicFormReducer
})

const composeEnhancers = process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null || compose;  

const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  }

  catch(e) {
    console.log("Error saving redux store to local storage.", e)
  }
}

const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('state')
    if (serializedState === null) return undefined
    // console.log("Restored State", JSON.parse(serializedState))
    return JSON.parse(serializedState)
  }

  catch(e) {
    console.log('Error loading redux state from local storage', e)
    return undefined
  }
}

const persistedState = loadFromLocalStorage()

const store = createStore(
  rootReducer,
  persistedState,
  composeEnhancers(
    applyMiddleware(
      thunk
      // reduxImmutableStateInvariant()
    )
  )
);

store.subscribe(() => saveToLocalStorage(store.getState()))
// End Redux Configuration

// Apollo Client Configuration
const uri = process.env.REACT_APP_GQL_ENDPOINT
const httpLink = new createHttpLink({ uri })
const token = localStorage.getItem(AUTH_TOKEN);

let link = null

if (token) {
  const authLink = new ApolloLink((operation, forward) => {
    const authorizationHeader = token ? `Bearer ${token}` : ""
    operation.setContext({
      headers: {
        authorization: authorizationHeader
      }
    })
    return forward(operation)
  })
  link = authLink.concat(httpLink)
} else {
  link = httpLink
}

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
})
// End Apollo Configuration

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </Provider>
  , document.getElementById('root')
)
registerServiceWorker()