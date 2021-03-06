import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import asyncComponent from './hoc/asyncComponent'
import DataGrid from './containers/DataGrid/DataGrid'
import './assets/scss/material-dashboard-pro-react.css'

const asyncTestForm = asyncComponent(() => {
  return import('./views/TestForm/TestForm');
});

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route path="/" exact component={asyncTestForm} /> 
          <Route path="/datagrid" exact component={DataGrid} /> 
        </Switch>
      </div>
    )
  }
}

export default App