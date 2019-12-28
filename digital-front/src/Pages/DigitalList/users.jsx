import React, { Component } from 'react';
import Header from '../../Common/header';
import UsersTable from './usersTable';
import '../../Common/table.css';

class Users extends Component {
    render() {
        return (
            <div>
                <Header></Header>
                <div className="table">
                    <UsersTable></UsersTable>
                </div>
            </div>
        )
    }
}

export default Users;


