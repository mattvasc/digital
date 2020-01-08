import React, {Component} from 'react';
import '../NewDigital/userForm.css';
import 'react-table/react-table.css';
import Popup from "reactjs-popup";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

class DeleteModal extends Component {
    state = {
        open: false
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    deleteUser(row) {
        axios.delete(process.env.REACT_APP_API_URL+`user`, { id: this.props.id })
            .then(() => {
                this.props.history.push('/');
            })
            .catch(err => {
                console.log(err.message);
            });
    }

    render() {
        return (
            <div>
                <button title="Apagar usuário" className="linkButton" onClick={this.openModal.bind(this)}><FontAwesomeIcon icon={faTrash}/></button>
                <Popup open={this.state.open} onClose={this.closeModal.bind(this)} modal>
                    <div className="deleteModal">
                        <h4>Deseja realmente deletar o usuário {this.props.name}?</h4>
                        <button className="button" type="button" onClick={this.closeModal.bind(this)}>Não</button>
                        <button className="button" type="button" onClick={this.deleteUser.bind(this)}>Sim</button>
                    </div>
                </Popup>    
            </div>
        );
    }
}

export default DeleteModal;