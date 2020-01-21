import React, { Component } from 'react';
import moment from 'moment';
import 'moment-timezone';

class FilterTable extends Component {
    state = {
        date: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD')
    }

    handleDateChange(input) {
        this.setState({ date: input.target.value });
        this.props.onSelectedDate(input.target.value);
    }

    render() {
        return (
            <form className="filterContainer">
                <label>Escolha uma data: </label>
                <input type="date" value={this.state.date} onChange={this.handleDateChange.bind(this)}></input>
            </form>
        )
    }
}

export default FilterTable;