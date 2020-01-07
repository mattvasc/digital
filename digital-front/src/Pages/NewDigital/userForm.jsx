import React, {Component} from 'react';
import './userForm.css';
import 'react-table/react-table.css';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

class UserForm extends Component {
    state = {
        name: "",
        email: "",
        phone: "",
        createError: ""
    };

    finish() {
        if (this.state.name === "" || this.state.email === "") {
            this.setState({ createError: "Por favor, preencha os campos de nome e email para prosseguir" });
            return;
        } else {
            this.setState({ createError: "" });
        }
        axios.post(process.env.REACT_APP_API_URL+`user`, { name: this.state.name, email: this.state.email, phone: this.state.phone })
            .then(() => {
                this.props.history.push('/');
            })
            .catch(err => {
                this.setState({ createError: "Erro ao cadastrar usuário. Por favor, tente novamente." });
                return;
            })
    }

    render() {
        return (
            <div className="content">
                <form className='formDigital'>
                    <p className="error">{this.state.createError}</p>           
                    <input
                        type="text"
                        placeholder="Nome"
                        onChange={e => this.setState({ createError: "", name: e.target.value })}
                        value={this.props.name}
                        className="nameField"
                    />
                    <div className="contactFields">
                        <input
                            type="text"
                            placeholder="E-mail"
                            onChange={e => this.setState({ createError: "", email: e.target.value })}
                            value={this.props.email}
                            className="email"
                        />
                        <input
                            type="text"
                            placeholder="Telefone (sem traço)"
                            onChange={e => this.setState({ createError: "", phone: e.target.value })}
                            value={this.props.phone}
                            maxLength="11"
                            className="phone"
                        />
                    </div>
                </form>
                <button className="button submitButton" type="submit" onClick={this.finish.bind(this)}>Concluir cadastro</button>
            </div>
        );
    }
}

export default withRouter(UserForm);