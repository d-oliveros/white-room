import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import DatePicker from '#client/components/DatePicker/DatePicker.js';

class FilterDate extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]).isRequired,
  }

  _onChange = (event) => {
    const {
      onChange,
    } = this.props;

    const value = event && event.toDate ? event.toDate() : '';
    onChange(value);
  }

  render() {
    const {
      value,
    } = this.props;
    const dateMoment = typeof value === 'string'
      ? moment(value)
      : value;

    return (
      <div>
        <DatePicker
          value={dateMoment}
          onChange={this._onChange}
          isValidDate={(current) => current.isAfter(new Date())}
          closeOnSelect
        />
      </div>
    );
  }
}

export default FilterDate;
