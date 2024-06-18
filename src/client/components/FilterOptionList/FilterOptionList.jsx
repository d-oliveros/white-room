import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class FilterOptionList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    optionList: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
    value: PropTypes.array,
  }

  static defaultProps = {
    value: [],
  }

  _onChangeCheckbox = (formValue) => {
    const {
      onChange,
      value,
    } = this.props;

    const newValue = value.includes(formValue)
      ? value.filter((val) => val !== formValue)
      : [...value, formValue];

    onChange(newValue);
  }

  render() {
    const {
      optionList,
      value,
    } = this.props;

    return (
      <div className='list'>
        {optionList.map((option) => (
          <div
            key={option.value}
            className={classNames('item', {
              active: value.includes(option.value),
            })}
            onClick={() => {
              this._onChangeCheckbox(option.value);
            }}
          >
            <span>
              {option.label}
            </span>
          </div>
        ))}
      </div>
    );
  }
}

export default FilterOptionList;
