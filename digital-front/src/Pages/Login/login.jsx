import React, { Component } from "react";
import './login.css';
import Container from './container';
import { withRouter } from 'react-router-dom';
import { login, isAuthenticated } from "../../Common/auth";

class Login extends Component {
  state = {
    user: "",
    password: "",
    error: ""
  };

  handleLogin = async e => {
    e.preventDefault();
    const { user, password } = this.state;
    if (!user || !password) {
      if (!user && !password) {
        this.setState({ error: "Preencha usuário e senha para continuar"});
      } else if (!user) {
        this.setState({ error: "Preencha o usuário para continuar"});
      } else {
        this.setState({ error: "Preencha a senha para continuar"});
      }
    } else {
      try {
        // Chamar api para pegar o token
        login('teste123');
        this.props.history.push('/');
      } catch (err) {
        this.setState({ error: "Houve um erro com o login. Por favor, verifique seus dados" });
      }
    }
  }

  render() {
    if (isAuthenticated()) {
      this.props.history.push('/');
    }

    return (
      <Container>
        <form onSubmit={this.handleLogin} className='formLogin'>
          <h1 className="title">LERIS</h1>
          <h3 className="subtitle">Gerenciamento de digitais</h3>
          <p className="error">{this.state.error}</p>
          <input
            type="text"
            placeholder="Usuário"
            onChange={e => this.setState({ user: e.target.value })}
          />
          <input
            type="password"
            placeholder="Senha"
            onChange={e => this.setState({ password: e.target.value })}
          />
          <button type="submit">Entrar</button>
        </form>
      </Container>
    );
  }
}

export default withRouter(Login);