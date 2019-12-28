import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Modal from 'react-responsive-modal';
import DigitalForm from './../NewDigital/digitalForm';

class UsersTable extends Component {
    state = {
        open: false,
        modalData: {}
    };

    onOpenModal = () => {
        this.setState({ open: true });
    };
    
    onCloseModal = () => {
        this.setState({ open: false });
    };

    Edit() {
        this.onOpenModal();
    }

    render() {
        const { openModal } = false;
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
            accessor: 'fingers'
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
            Header: 'Alterar',
            accessor: 'change',
            Cell: (row) => {
                return <div onClick={this.Edit.bind(this)}><img src="user-edit-solid.svg" alt="editar usuário"/></div>
            }
        }];
        return (
            <div>
                <ReactTable showFilters={true} noDataText={_ => null} data={data} columns={columns} defaultPageSize={1} showPagination={false} resizable={false}></ReactTable>
                <Modal open={openModal} onClose={this.onCloseModal.bind(this)} closeOnEsc={true}>
                    <DigitalForm></DigitalForm>
                </Modal>
            </div>
        )
    }
}

export default UsersTable;