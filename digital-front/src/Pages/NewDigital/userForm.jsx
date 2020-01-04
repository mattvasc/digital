import React, {Component} from 'react';
import './userForm.css';
import 'react-table/react-table.css';
import { withRouter } from 'react-router-dom';

class UserForm extends Component {
    state = {
        name: "",
        email: "",
        phone: "",
        createError: ""
    };

    finish() {
        if (this.state.name === "" || this.state.email === "") {
            this.setState({ createError: "Por favor, preencha pelo menos os campos de nome e email" });
            return;
        } else {
            this.setState({ createError: "" });
        }
        // post

        this.props.history.push('/');
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