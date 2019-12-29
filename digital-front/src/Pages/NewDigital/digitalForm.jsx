import React, {Component} from 'react';
import './digitalForm.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Popup from "reactjs-popup";
import Fingers from '../../Common/fingers';

class DigitalForm extends Component {
    state = {
        name: "",
        email: "",
        phone: "",
        savedFingers: []
    };

    fingersOptionList() {
        return (
            <select className="fingersList" onChange={this.readFingers.bind(this)}>
                <option key="" selected="true" disabled="disabled">Escolha um dedo para cadastro</option>
                {Object.keys(Fingers).map(item => (
                    <option value={item}>{Fingers[item]}</option>
                ))}
            </select>
        );
    }

    readFingers(finger) {
        console.log(finger.target.value);
    }

    saveFingers() {

    }

    finish() {
        if (this.state.name === "" || (this.state.email === "" && this.state.phone === "")) {
            console.log('Erro');
        }
        // post
    }

    render() {
        const columns = [{
            accessor: 'finger'
        }];

        return (
            <div className="content">
                <form className='formDigital'>
                    <input
                        type="text"
                        placeholder="Nome"
                        onChange={e => this.setState({ name: e.target.value })}
                        value={this.props.name}
                        className="nameField"
                    />
                    <div className="contactFields">
                        <input
                            type="text"
                            placeholder="E-mail"
                            onChange={e => this.setState({ email: e.target.value })}
                            value={this.props.email}
                            className="email"
                        />
                        <input
                            type="text"
                            placeholder="Telefone (sem traço)"
                            onChange={e => this.setState({ phone: e.target.value })}
                            value={this.props.phone}
                            maxLength="11"
                            className="phone"
                        />
                    </div>
                    <Popup trigger={
                        <button onClick={this.saveFingers.bind(this)} type="button" className="button">Cadastrar dedos</button>
                    } modal closeOnDocumentClick closeOnEscape>
                        {close => (
                            <div className="modalFingers">
                                {this.fingersOptionList()}
                                <button className="button" type="button" onClick={close}>Fechar</button>
                            </div>
                        )}
                    </Popup>
                    <ReactTable className="fingerTable" showFilters={false} data={this.state.savedFingers} TheadComponent={_ => null} columns={columns} defaultPageSize={0} showPagination={false} resizable={false}></ReactTable>
                </form>
                <button className="button submitButton" type="submit" onClick={this.finish.bind(this)}>Concluir cadastro</button>
            </div>
        );
    }
}

export default DigitalForm;