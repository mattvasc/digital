import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class LogTable extends Component {
    render() {
        const data = [{
            name: 'Giovanna',
            date: '12/10/2019',
            time: '12:30',
            email: 'giovanna.blasco@hotmail.com'
        }];
        const columns = [
        {
            Header: 'Nome',
            accessor: 'name',
            className: 'center'
        },
        {
            Header: 'Data',
            accessor: 'date',
            className: 'center'
        },
        {
            Header: 'Hora',
            accessor: 'time',
            className: 'center'
        },
        {
            Header: 'Email',
            accessor: 'email',
            className: 'center'
        }];
        return (
            <ReactTable showFilters={true} noDataText={_ => null} data={data} columns={columns} defaultPageSize={1} showPagination={false} resizable={false}></ReactTable>
        )
    }
}

export default LogTable;