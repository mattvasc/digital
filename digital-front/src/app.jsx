import React from 'react';
import Routes from './routes';
import { ReactTableDefaults } from 'react-table';

const NullComponent = () => null;
Object.assign(ReactTableDefaults, { NoDataComponent: NullComponent });
const App = () => <Routes />;
export default App;