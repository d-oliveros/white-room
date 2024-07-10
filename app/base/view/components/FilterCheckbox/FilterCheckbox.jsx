import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class FilterCheckbox extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    value: false,
  }

  _onChange = () => {
    const {
      id,
      onChange,
      value,
    } = this.props;

    const newValue = !value;
    onChange(id, newValue);
  }

  render() {
    const {
      value,
      className,
      disabled,
    } = this.props;

    return (
      <input
        className={classnames('switch', className, { disabled: disabled })}
        type='checkbox'
        checked={value}
        onChange={this._onChange}
        disabled={disabled}
      />
    );
  }
}

export default FilterCheckbox;
