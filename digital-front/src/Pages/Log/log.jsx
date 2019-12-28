import React, { Component } from 'react';
import Header from '../../Common/header';
import LogTable from './logTable';
import '../../Common/table.css';

class Log extends Component {
    render() {
        return (
            <div>
                <Header></Header>
                <div className="table">
                    <LogTable></LogTable>
                </div>
            </div>
        )
    }
}

export default Log;