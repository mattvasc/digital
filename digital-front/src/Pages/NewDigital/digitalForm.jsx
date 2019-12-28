import React, {Component} from 'react';
import './digitalForm.css';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

class DigitalForm extends Component {
    state = {
        name: "",
        email: "",
        phone: "",
        savedFingers: []
    };

    saveFingers() {

    }

    render() {
        const columns = [{
            accessor: 'finger'
        }];

        return (
            <div className="content">
                <form onSubmit={console.log("submited")} className='formDigital'>
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
                            placeholder="Telefone"
                            onChange={e => this.setState({ phone: e.target.value })}
                            value={this.props.phone}
                            className="phone"
                        />
                    </div>
                    <button onClick={this.saveFingers.bind(this)} type="button" className="button">Cadastrar dedos</button>
                    <ReactTable className="fingerTable" showFilters={false} data={this.state.savedFingers} TheadComponent={_ => null} columns={columns} defaultPageSize={0} showPagination={false} resizable={false}></ReactTable>
                </form>
                <button className="button submitButton" type="submit">Concluir cadastro</button>
            </div>
        );
    }
}

export default DigitalForm;