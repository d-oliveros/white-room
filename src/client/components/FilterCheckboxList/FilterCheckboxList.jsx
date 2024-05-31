import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class FilterCheckboxList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    checkboxList: PropTypes.array.isRequired,
    value: PropTypes.array,
  }

  static defaultProps = {
    value: [],
  }

  _onClickCheckboxOption = (formValue) => {
    const {
      id,
      value,
      onChange,
    } = this.props;

    const newValue = value.includes(formValue)
      ? value.filter((val) => val !== formValue)
      : [...value, formValue];

    onChange(id, newValue);
  }

  render() {
    const {
      checkboxList,
      value,
    } = this.props;

    return (
      <div className='tabPicker clearfix'>
        {checkboxList.map((checkboxOption) => (
          <span
            key={checkboxOption.value}
            className={classNames('choice', {
              active: value.includes(checkboxOption.value),
            })}
            onClick={() => (
              this._onClickCheckboxOption(checkboxOption.value)
            )}
          >{checkboxOption.label}
          </span>
        ))}
      </div>
    );
  }
}

export default FilterCheckboxList;
