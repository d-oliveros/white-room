/**
 * Taken from https://raw.githubusercontent.com/linchen2chris/date-input/master/src/ExpirationDateInput.jsx.
 *
 * We can't use the "date-input" contrib module directly from npm
 * because it imports raw `.css` files which we don't currently support.
 */
/* eslint-disable */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

function padSingleDigit(dateValue) {
  return dateValue.length === 1
    ? (dateValue === '0'
      ? '01'
      : `0${dateValue}`
    )
    : (dateValue === '00'
      ? '01'
      : dateValue
    )
}

class ExpirationDateInput extends Component {
  constructor(props) {
    super(props);
    this.state = this.parseDate(props.value);
  }

  parseDate(value) {
    if (value !== undefined && value.match(/\d{0,2}-\d{0,2}/)) {
      const dateArray = value.split('-');
      return {
        month: dateArray[0],
        year: dateArray[1],
        value: value,
        error: false,
      };
    }
    return {
      year: '',
      month: '',
      value: '',
      error: false,
    };
  }

  correctValue(dateProp, value) {
    switch(dateProp) {
    case 'month':
      return value > 12 ? 12 : value;
    default:
      return value;
    }
  };

  updateDate (dateProp, value) {
    if (value !== '' && !value.match(/^\d+$/)) {
      return;
    }

    const correctedValue = this.correctValue(dateProp, value);
    const newState = Object.assign({}, this.state, {[dateProp]: correctedValue});

    const monthFocused = this.monthInput === document.activeElement;

    const monthValue = monthFocused ? newState.month : padSingleDigit(newState.month);
    const yearValue = newState.year;

    const dateValue = `${monthValue}-${yearValue}`;

    this.setState({
      year: yearValue,
      month: monthValue,
      value: dateValue,
    });

    this.props.onChange(dateValue);
  };

  handleFocus(dateProp, value) {
    if (dateProp === 'year') {
      return;
    }

    const monthFocused = this.monthInput === document.activeElement;

    if (monthFocused && value.length >=2) {
      this.yearInput.focus();
    }
  };
  onChange(dateProp, value) {
    this.updateDate(dateProp, value);
    this.handleFocus(dateProp, value);
  };

  onBlur(e) {
    const currentTarget = e.currentTarget;

    const monthValue = padSingleDigit(this.state.month);
    const yearValue = this.state.year;

    const currentValue = `${yearValue}-${monthValue}`;

    setTimeout(() => {
      if(!currentTarget.contains(document.activeElement)) {
        if(this.state.value !== currentValue) {
          this.props.onChange(currentValue);
        }
        if(this.props.onBlur) {
          this.props.onBlur(currentValue);
        }
      }
    });
  };
  render() {
    return (
      <div className='dateFieldContainer'>
        <div className={ `${this.state.error ? 'is-invalid' : ''} outline-container` } onBlur={e => this.onBlur(e)}>
          <div id='month-container' className='date--input-container'>
            <input
              id={`${this.props.formFieldId}-month`}
              ref={input => this.monthInput = input}
              placeholder="mm"
              type="tel"
              maxLength="2"
              className="date--input"
              value={this.state.month}
              onChange={e => this.onChange('month', e.target.value)}
              onBlur={e => this.updateDate('month', e.target.value)}
              disabled={this.props.disabled}
            />
            <span className="date--separator">/</span>
          </div>
          <div id="year-container" className="date--input-container">
            <input
              id={`${this.props.formFieldId}-year`}
              ref={input => this.yearInput = input}
              placeholder="yy"
              type="tel"
              maxLength="2"
              className="date--input"
              value={this.state.year}
              onChange={e => this.onChange('year', e.target.value)}
              onBlur={e => this.updateDate('year', e.target.value)}
              disabled={this.props.disabled}
            />
          </div>
        </div>
        {this.state.error && <p className="is-invalid">{this.state.errorMessage}</p>}
      </div>
    )
  }
}

ExpirationDateInput.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  formFieldId: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  minDate: PropTypes.string,
  minDateError: PropTypes.string,
  maxDate: PropTypes.string,
  maxDateError: PropTypes.string,
  invalidError: PropTypes.string,
  disabled: PropTypes.bool,
  rules: PropTypes.array,
};

ExpirationDateInput.defaultProps = {
  disabled: false,
  minDate: null,
  maxDate: null,
  minDateError: null,
  maxDateError: null,
  invalidError: null,
  rules: null,
  onChange: () => {},
  onBlur: () => {},
};

export default ExpirationDateInput;
