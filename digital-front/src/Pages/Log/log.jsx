import React, { Component } from 'react';
import Header from '../../Common/header';
import LogTable from './logTable';
import '../../Common/table.css';
import FilterTable from './filterTable';
import moment from 'moment';

class Log extends Component {
    state = {
        date: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD')
    }

    changeDate = (newDate) => {
        this.setState({ date: newDate });
    }

    render() {
        return (
            <div>
                <Header></Header>
                <div className="table">
                    <FilterTable onSelectedDate={this.changeDate}></FilterTable>
                    <LogTable date={this.state.date}></LogTable>
                </div>
            </div>
        )
    }
}

export default Log;