import React, {Component} from 'react';
import './header.css';
import { withRouter } from 'react-router-dom';
import {logout} from './auth';

class Header extends Component {
  redirect(page) {
    switch(page) {
      case 'logout':
        logout();
        this.props.history.push('/');
        break;
      case 'cadastro':
      case 'registros':
        this.props.history.push(page);
        return;
      default:
        this.props.history.push('/');
        break;
    }
  }

  render() {
    return (
      <header className="header">
        <div onClick={this.redirect.bind(this)} className="logo link">LERIS</div>
        <nav>
          <ul className="list">
            <li onClick={this.redirect.bind(this, "")} className="link">Usuários</li>
            <li className="separator">/</li>
            <li onClick={this.redirect.bind(this, "cadastro")} className="link">Nova digital</li>
            <li className="separator">/</li>
            <li onClick={this.redirect.bind(this, "registros")} className="link">Registros</li>
            <li className="separator">/</li>
            <li onClick={this.redirect.bind(this, "logout")} className="link logout">Sair</li>
          </ul>
        </nav>
      </header>
    );
  }
}

export default withRouter(Header);