import React, {Component} from 'react';
import Header from './../../Common/header';
import UserForm from './userForm';
import Container from './container';

class CreateUser extends Component {
    render() {
        return (
            <div>
                <Header></Header>
                <Container>
                    <UserForm></UserForm>
                </Container>
            </div>
        );
    }
}

export default CreateUser;