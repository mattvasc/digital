import React, {Component} from 'react';
import '../../Common/globalStyle.css';
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
            this.setState({ createError: ""});
        }
        axios.post(process.env.REACT_APP_API_URL+`user`, { name: this.state.name, email: this.state.email, phone: this.state.phone })
            .then(() => {
                this.props.history.push('/');
            })
            .catch(err => {
                this.setState({ name: '', email: '', phone: '', createError: "Erro ao cadastrar usuário! Sua sessão pode ter expirado ou pode haver algum problema com o servidor." });
                return;
            })
    }

    enterPressed(event) {
        var code = event.keyCode || event.which;
        if(code === 13) {
            this.finish();
        } 
      }

    render() {
        return (
            <div className="content">
                <h2 className="pageTitle">Cadastro de usuário</h2>
                <form className='formDigital'>
                    <input
                        type="text"
                        placeholder="Nome"
                        onChange={e => this.setState({ createError: "", name: e.target.value })}
                        value={this.state.name}
                        className="nameField"
                        onKeyPress={this.enterPressed.bind(this)}
                    />
                    <div className="contactFields">
                        <input
                            type="text"
                            placeholder="E-mail"
                            onChange={e => this.setState({ createError: "", email: e.target.value })}
                            value={this.state.email}
                            className="email"
                            onKeyPress={this.enterPressed.bind(this)}
                        />
                        <input
                            type="text"
                            placeholder="Telefone (sem traço)"
                            onChange={e => this.setState({ createError: "", phone: e.target.value })}
                            value={this.state.phone}
                            maxLength="11"
                            className="phone"
                            onKeyPress={this.enterPressed.bind(this)}
                        />
                    </div>
                </form>
                <button className="button submitButton" type="submit" onClick={this.finish.bind(this)}>Concluir cadastro</button>
                <p className="error">{this.state.createError}</p>           
            </div>
        );
    }
}

export default withRouter(UserForm);