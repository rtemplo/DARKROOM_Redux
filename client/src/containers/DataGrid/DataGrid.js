import React, { Component } from 'react'
import './DataGrid.css'

import { Query } from 'react-apollo'
import query from '../../queries/fetchAllDemoFormSubs'

import { AgGridReact } from 'ag-grid-react'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'

class DataGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: 1,
            recordSize: 25,
            recordOffset: 0,
            orderBy: ["NATURAL"],
            columnDefs: [
                {headerName: 'Username', field: 'username'},
                {headerName: 'First', field: 'firstName'},
                {headerName: 'Last', field: 'lastName'},
                {headerName: 'Email', field: 'email'},
                {headerName: 'Selection 1', field: 'singleSelection'},
                {headerName: 'Selection 2', field: 'multipleSelection'},
                {headerName: 'Radio Sel', field: 'radioSelection'},
                {headerName: 'Checkbox Sel', field: 'checkboxSelection'},
                {headerName: 'Date Entry', field: 'dateEntry'},
                {headerName: 'Time Entry', field: 'timeEntry'}

            ]
        }
    }

    componentDidMount() {
        // fetch('https://api.myjson.com/bins/15psn9')
        //     .then(result => result.json())
        //     .then(rowData => this.setState({rowData}))
    }

    render() {
        const { recordSize, recordOffset, orderBy} = this.state

        return (
            <Query query={query} variables={
                {
                    first: recordSize, 
                    offset: recordOffset, 
                    orderBy: orderBy
                }
            }>
                {({loading, error, data}) => {
                    if (loading) return 'Loading ....'
                    if (error) return `Error! ${error.message}`
                    console.log(data)
                    return (
                        <div
                            className="ag-theme-balham"
                            style={{height: '800px', width: '100%'}}
                        >
                            <AgGridReact
                                enableSorting={true}
                                enableFilter={true}
                                pagination={true}
                                columnDefs={this.state.columnDefs}
                                rowData={data.allDemoFormPublics.nodes}>
                            </AgGridReact>
                        </div>
                    )
                }}
            </Query>
        );
    }
}

export default DataGrid;