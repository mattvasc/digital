import React, { Component } from 'react';
import ReactTable from 'react-table';
import './usersTable.css';
import 'react-table/react-table.css';
import DigitalForm from '../NewDigital/digitalForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Fingers from '../../Common/fingers';

class UsersTable extends Component {
    state = {
        data: [],
        completeLoad: false,
        loadError: "",
        noUsers: ""
    }

    getFingerprints(fingerprints) {
        let fingers = "";
        if(fingerprints === null || fingerprints === undefined) {
            return fingers;
        }

        fingerprints.forEach(fingerprint => {
            fingers += Fingers[fingerprint] + " - ";
        });

        return fingers.replace(/-\s*$/, "");;
    }

    componentDidMount() {
        axios.get(process.env.REACT_APP_API_URL+`user`)
            .then(res => {
                this.setState({ data: [] });
                if (res.data.length === 0) {
                    this.setState({noUsers: "Não há nenhum usuário cadastrado"});
                }
                console.log(res.data);
                res.data.forEach(user => {
                    let newUser = {
                        id: user.id,
                        name: user.name,
                        fingers: this.getFingerprints(user.finger),
                        email: user.email,
                        phone: user.phone
                    }
                    this.setState({ data: [ ...this.state.data, newUser]});
                });

                this.setState({ completeLoad: true });
            })
            .catch(err => {
                console.log(err);
                this.setState({loadError: "Erro ao carregar os usuários"});
            });
    }

    deleteUser(row) {
        axios.delete(process.env.REACT_APP_API_URL+`user`, { id: row.original.id })
            .then(() => {
                this.props.history.push('/');
            })
            .catch(err => {
                console.log(err.message);
            });
    }

    render() {
        const columns = [
        {
            Header: 'Nome',
            accessor: 'name',
            className: 'center',
            style: { 'whiteSpace': 'unset' }
        },
        {
            Header: 'Dedos cadastrados',
            accessor: 'fingers',
            className: 'center',
            style: { 'whiteSpace': 'unset' }
        },
        {
            Header: 'Telefone',
            accessor: 'phone',
            className: 'center'
        },
        {
            Header: 'Email',
            accessor: 'email',
            className: 'center',
            style: { 'whiteSpace': 'unset' }
        },
        {
            Header: 'Ações',
            accessor: 'actions',
            className: 'center',
            Cell: (row) => {
                return (
                    <div className="actions">
                        <DigitalForm></DigitalForm>
                        <button title="Apagar usuário" className="linkButton" onClick={this.deleteUser.bind(this, row)}><FontAwesomeIcon icon={faTrash}/></button>
                    </div>
                )
            }
        }];
        return (
            <div>
                <h3>{this.state.noUsers}</h3>
                <p className="error">{this.state.loadError}</p>
                <ReactTable showFilters={true} data={this.state.data} columns={columns} pageSize={this.state.data.length} showPagination={false} resizable={false}></ReactTable>
            </div>
        )
    }
}

export default withRouter(UsersTable);