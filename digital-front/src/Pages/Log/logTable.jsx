import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import axios from 'axios';
import * as moment from 'moment';
import Fingers from '../../Common/fingers';

class LogTable extends Component {
    state = {
        data: [],
        completeLoad: false,
        loadError: "",
        noLogs: ""
    }

    componentDidMount() {
        axios.get(process.env.REACT_APP_API_URL+`log`)
            .then(res => {
                this.setState({ data: [] });
                if (res.data.length === 0) {
                    this.setState({noLogs: "Não há nenhum registro"});
                }
                res.data.forEach(log => {
                    console.log(log.date);
                    let newUser = {
                        id: log.user?.id,
                        name: log.user?.name,
                        email: log.user?.email,
                        finger: log.fingerprint?.finger !== null ? Fingers[log.fingerprint.finger] : "-",
                        date: moment(log.date).format('DD/MM/YYYY'),
                        time: moment(log.date).format('HH:mm:ss')
                    }
                    this.setState({ data: [ ...this.state.data, newUser]});
                });
                this.setState({ completeLoad: true });
            })
            .catch(err => {
                console.log(err.message);
                this.setState({loadError: "Erro ao carregar os logs! Sua sessão pode ter expirado ou pode haver algum problema com o servidor."});
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
            Header: 'Digital utilizada',
            accessor: 'finger',
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
            className: 'center',
            style: { 'whiteSpace': 'unset' }
        }];
        return (
            <div>
                <h3>{this.state.noLogs}</h3> 
                <p className="error">{this.state.loadError}</p>
                <ReactTable data={this.state.data} columns={columns} pageSize={this.state.data.length} showPagination={false} resizable={false}></ReactTable>
            </div>
        )
    }
}

export default LogTable;