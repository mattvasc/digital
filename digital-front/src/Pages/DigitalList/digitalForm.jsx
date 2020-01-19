import React, {Component} from 'react';
import '../NewDigital/userForm.css';
import 'react-table/react-table.css';
import Popup from "reactjs-popup";
import Fingers from '../../Common/fingers';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFingerprint } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';

class DigitalForm extends Component {
    state = {
        readFinger: false,
        selectedFinger: {},
        fingerPosition: "",
        responseMessage: "",
        savedFingers: false,
        open: false
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    selectFinger(finger) {
        var fingerIndex = parseInt(finger.target.value);
        this.setState({ selectedFinger: { index: fingerIndex, name: finger.target[fingerIndex+1].text } });
    }

    handleClose() {
        this.closeModal.bind(this);
        if (this.savedFingers) {
            this.props.onCreatedDigital();
        }
    }

    readFingers() {
        if (this.state.selectedFinger.index === undefined) {
            return;
        }
        this.setState({ createError: "", readFinger: true, fingerPosition: "Por favor, posicione o dedo " + this.state.selectedFinger.name + " no dispositivo até que a luz pisque. Assim que piscar, retire o dedo rapidamente e repita esse mesmo procedimento mais 4 vezes."})
        axios.post(this.props.userId + '/finger/' + this.state.selectedFinger.value)
            .then((res) => {
                this.setState({ fingerPosition: "", responseMessage: "Digital do " + this.state.selectedFinger.name + " cadastrado com sucesso!", readFinger: false, savedFingers: true })
            })
            .catch((err) => {
                this.setState({ fingerPosition: "", responseMessage: "Erro ao cadastrar digital! Por favor, tente novamente.", readFinger: false });
                console.log(err.message);
            });
    }

    render() {
        return (
            <div>
                <button title="Cadastrar dedo" className="linkButton" onClick={this.openModal.bind(this)}><FontAwesomeIcon icon={faFingerprint}/></button>
                <Popup open={this.state.open} closeOnDocumentClick={false} closeOnEscape={false} modal>
                    <div>
                        <div className="modalFingers">
                            <select className="fingersList" defaultValue="default" onChange={this.selectFinger.bind(this)}>
                                <option key="-1" value="default" disabled={true}>Escolha um dedo para cadastro</option>
                                {Object.keys(Fingers).map(item => (
                                    <option key={item} value={item} disabled={this.state.readFinger}>{Fingers[item]}</option>
                                ))}
                            </select>
                            <button onClick={this.readFingers.bind(this)} type="button" className="button insert" disabled={this.state.readFinger}>Inserir dedo</button>
                            <h5 className="fingerPosition">{this.state.fingerPosition}</h5>
                            <Loader type="Rings" color="#895aa1" height={100} width={100} visible={this.state.readFinger}/>
                            <h5>{this.state.responseMessage}</h5>
                            <button onClick={this.handleClose.bind(this)} type="button" className={this.state.readFinger ? "hidden" : "button"}>Sair</button>
                        </div>
                    </div>
                </Popup>    
            </div>
        );
    }
}

export default DigitalForm;