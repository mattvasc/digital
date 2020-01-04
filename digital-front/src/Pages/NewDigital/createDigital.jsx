import React, {Component} from 'react';
import Header from './../../Common/header';
import DigitalForm from './digitalForm';
import Container from './container';

class CreateDigital extends Component {
    render() {
        return (
            <div>
                <Header></Header>
                <Container>
                    <DigitalForm></DigitalForm>
                </Container>
            </div>
        );
    }
}

export default CreateDigital;