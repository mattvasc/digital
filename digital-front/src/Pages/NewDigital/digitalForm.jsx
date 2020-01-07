import React, {Component} from 'react';
import './userForm.css';
import 'react-table/react-table.css';
import Popup from "reactjs-popup";
import Fingers from '../../Common/fingers';
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFingerprint } from '@fortawesome/free-solid-svg-icons'

class DigitalForm extends Component {
    state = {
        savedFingers: [],
        readFinger: false,
        selectedFinger: {},
        fingerPosition: "",
        responseMessage: "",
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

    readFingers() {
        if (this.state.selectedFinger.index === undefined) {
            return;
        }
        this.setState({ createError: "", readFinger: true, fingerPosition: "Por favor, posicione o dedo " + this.state.selectedFinger.name + " no dispositivo até que a luz pisque. Assim que piscar, retire o dedo rapidamente e repita esse mesmo procedimento mais 4 vezes."})
    }

    render() {
        return (
            <div>
                <button onClick={this.openModal.bind(this)}><FontAwesomeIcon icon={faFingerprint}/></button>
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
                            <button onClick={this.closeModal.bind(this)} type="button" className={this.state.readFinger ? "hidden" : "button"}>Sair</button>
                        </div>
                    </div>
                </Popup>    
            </div>
        );
    }
}

export default DigitalForm;