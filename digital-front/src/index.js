import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';
import { getToken, login } from '../src/Common/auth';

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    if (response.headers['new-token'] !== undefined) {
        login(response.headers['new-token']);
    }
    return response;
}, function (error) {
    if (error.response !== undefined && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Operação não autorizada... Realizando logout.');
        localStorage.clear();
        if (window.location.pathname !== '/login') {
            window.location.replace('/');
        }
    }
    return Promise.reject(error.response);
});

// Add a request interceptor
axios.interceptors.request.use(function (request) {
    request.headers['x-access-token'] = getToken();
    return request;
}, function (error) {
    if (error.response !== undefined && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Operação não autorizada... Realizando logout.');
        localStorage.clear();
        if (window.location.pathname !== '/login') {
            window.location.replace('/');
        }
    }
    return Promise.reject(error.response);
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
