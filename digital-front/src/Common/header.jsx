import React, {Component} from 'react';
import './header.css';
import { withRouter } from 'react-router-dom';
import {logout} from './auth';
import Popup from "reactjs-popup";

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
      <div>
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
              <Popup width="12px" trigger={
                    <li className="link">Sair</li>
                  } modal closeOnDocumentClick closeOnEscape>
                  {close => (
                      <div>
                        <h4>Deseja realmente sair?</h4>
                        <button className="button" type="button" onClick={this.redirect.bind(this, "logout")}>Sim</button>
                        <button className="button" type="button" onClick={close}>Não</button>
                      </div>
                  )}
              </Popup>
            </ul>
          </nav>
        </header>
    </div>
    );
  }
}

export default withRouter(Header);