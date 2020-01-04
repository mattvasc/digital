import React, { Component } from 'react';
import ReactTable from 'react-table';
import './usersTable.css';
import 'react-table/react-table.css';
import DigitalForm from '../NewDigital/digitalForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

class UsersTable extends Component {
    Edit() {
    }

    render() {
        const data = [{
            name: 'Giovanna',
            fingers: '',
            phone: '15981027197',
            email: 'giovanna.blasco@hotmail.com'
        }];
        const columns = [
        {
            Header: 'Nome',
            accessor: 'name',
            className: 'center'
        },
        {
            Header: 'Dedos cadastrados',
            accessor: 'fingers',
            className: 'center'
        },
        {
            Header: 'Telefone',
            accessor: 'phone',
            className: 'center'
        },
        {
            Header: 'Email',
            accessor: 'email',
            className: 'center'
        },
        {
            Header: 'Ações',
            accessor: 'actions',
            className: 'center',
            Cell: (row) => {
                return (
                    <div className="actions">
                        <DigitalForm userId = {0}></DigitalForm>
                        <a><FontAwesomeIcon icon={faTrash}/></a>
                    </div>
                )
            }
        }];
        return (
            <div>
                <ReactTable showFilters={true} data={data} columns={columns} defaultPageSize={1} showPagination={false} resizable={false}></ReactTable>
            </div>
        )
    }
}

export default UsersTable;