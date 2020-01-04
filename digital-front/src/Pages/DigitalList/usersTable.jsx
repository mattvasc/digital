import React, { Component } from 'react';
import ReactTable from 'react-table';
import './usersTable.css';
import 'react-table/react-table.css';
import DigitalForm from '../NewDigital/digitalForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

class UsersTable extends Component {
    state = {
        data: []
    }
    Edit() {
    }

    componentDidMount() {
        try  {
            axios.get(`http://localhost:2000/user`)
                .then(res => {
                    this.setState({ data: [] });
                    res.data.map(user => {
                        let newUser = {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            phone: user.phone
                        }
                        this.setState({ data: [ ...this.state.data, newUser]});
                    });
                });
        } 
        catch(err) {
            
        }
    }

    render() {
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
                <ReactTable showFilters={true} data={this.state.data} columns={columns} pageSize={this.state.data.length} showPagination={false} resizable={false}></ReactTable>
            </div>
        )
    }
}

export default UsersTable;