import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Login from './Pages/Login/login';
import Users from './Pages/DigitalList/users';
import Log from './Pages/Log/log';
import CreateUser from './Pages/NewDigital/createUser';

import { isAuthenticated } from './Common/auth';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
      )
    }
  />
);

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path='/login' component={Login} />
      <PrivateRoute exact path='/' component={() => <Users></Users>} />
      <PrivateRoute path='/cadastro' component={() => <CreateUser></CreateUser> } /> 
      <PrivateRoute path='/registros' component={() => <Log></Log>} />
      <Route path='*' component={() => <h1>Página não encontrada</h1>} />
    </Switch>
  </BrowserRouter>
);

export default Routes;