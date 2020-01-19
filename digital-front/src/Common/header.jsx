import React, {Component} from 'react';
import './header.css';
import { withRouter } from 'react-router-dom';
import {logout} from './auth';
import Popup from "reactjs-popup";

class Header extends Component {
  redirect(link, mustLogout) {
    if (mustLogout) {
      logout();
    }
    this.props.history.push(link);
  }

  render() {
    return (
      <div>
        <header className="header">
          <div onClick={this.redirect.bind(this, "/", false)} className="logo link">Digitais</div>
          <nav>
            <ul className="list">
              <li onClick={this.redirect.bind(this, "/", false)} className="link">Usuários</li>
              <li className="separator">|</li>
              <li onClick={this.redirect.bind(this, "/registros", false)} className="link">Registros</li>
              <li className="separator">|</li>
              <Popup width="12px" trigger={
                    <li className="link">Sair</li>
                  } modal closeOnDocumentClick closeOnEscape>
                  {close => (
                      <div className="logout">
                        <h4>Deseja realmente sair?</h4>
                        <div>
                          <button className="button" type="button" onClick={this.redirect.bind(this, "/", true)}>Sim</button>
                          <button className="button" type="button" onClick={close}>Não</button>
                        </div>
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