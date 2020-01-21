import React, { Component } from 'react';
import ReactTable from 'react-table';
import '../../Common/globalStyle.css';
import 'react-table/react-table.css';
import DigitalForm from './digitalForm';
import DeleteModal from './deleteModal';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Fingers from '../../Common/fingers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'

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

    loadUsers() {
        axios.get(process.env.REACT_APP_API_URL+`user`)
            .then(res => {
                this.setState({ data: [] });
                if (res.data.length === 0) {
                    this.setState({noUsers: "Não há nenhum usuário cadastrado"});
                }
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
                this.setState({loadError: "Erro ao carregar os usuários! Sua sessão pode ter expirado ou pode haver algum problema com o servidor."});
            });
    }

    handleUpdate = () => {
        this.loadUsers();
    }

    redirect(link) {
        this.props.history.push(link);
    }

    componentDidMount() {
        this.loadUsers();
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
                        <DigitalForm userId={row.original.id} onCreatedDigital={this.handleUpdate}></DigitalForm>
                        <DeleteModal id={row.original.id} name={row.original.name} onDeleteUser={this.handleUpdate}></DeleteModal>
                    </div>
                )
            }
        }];
        return (
            <div>
                <div className="cadastro">
                    <button type="button" className="button" onClick={this.redirect.bind(this, '/cadastro')}><FontAwesomeIcon icon={faUserPlus}/> Novo usuário</button>
                </div>
                <h3>{this.state.noUsers}</h3>
                <p className="error">{this.state.loadError}</p>
                <ReactTable showFilters={true} data={this.state.data} columns={columns} pageSize={this.state.data.length} showPagination={false} resizable={false}></ReactTable>
            </div>
        )
    }
}

export default withRouter(UsersTable);