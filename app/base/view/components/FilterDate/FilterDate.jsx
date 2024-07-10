import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import DatePicker from '#base/view/components/DatePicker/DatePicker.jsx';

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
      ? dayjs(value)
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
