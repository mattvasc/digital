import React, { Component } from "react";
import '../../Common/globalStyle.css';
import Container from './container';
import { withRouter } from 'react-router-dom';
import { login, isAuthenticated } from "../../Common/auth";
import axios from 'axios';

class Login extends Component {
  state = {
    user: "",
    password: "",
    error: ""
  };

  async handleLogin() {
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
      axios.post(process.env.REACT_APP_API_URL+`login`, { user: user, pwd: password })
        .then((response) => {
          console.log(response);
          if (response.status !== 200) {
            this.setState({ user: '', password: '', error: "Houve um erro com o login. Por favor, verifique seus dados" });
            return;
          }
          login(response.data.token);
          this.props.history.push('/');
        })
        .catch(err => {
          console.log(err);
          this.setState({ user: '', password: '', error: "Houve um erro com o login. Por favor, verifique seus dados" });
        })
    }
  }

  enterPressed(event) {
    var code = event.keyCode || event.which;
    if(code === 13) {
        this.handleLogin();
    } 
  }

  render() {
    if (isAuthenticated()) {
      this.props.history.push('/');
    }

    return (
      <Container>
        <form className='formLogin'>
          <h2 className="title">Gerenciamento de digitais</h2>
          <input
            type="text"
            placeholder="Usuário"
            value={this.state.user}
            onChange={e => this.setState({ user: e.target.value })}
            onKeyPress={this.enterPressed.bind(this)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={this.state.password}
            onChange={e => this.setState({ password: e.target.value })}
            onKeyPress={this.enterPressed.bind(this)}
          />
          <button type="button" onClick={this.handleLogin.bind(this)}>Entrar</button>
        </form>
        <p className="error">{this.state.error}</p>
      </Container>
    );
  }
}

export default withRouter(Login);