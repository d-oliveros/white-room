import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ensureValueIsArray = (value) => Array.isArray(value)
  ? value
  : [value];

class FilterTabList extends Component {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.array,
    ]),
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    tabList:  PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
      label: PropTypes.string.isRequired,
    })),
    multi: PropTypes.bool,
  };

  _onClickTabOption = (formValue) => {
    const {
      id,
      onChange,
      multi,
      value,
    } = this.props;

    if (!multi) {
      onChange(id, formValue);
    }
    else {
      const arrayValue = ensureValueIsArray(value);
      const newValue = arrayValue.includes(formValue)
        ? arrayValue.filter((val) => val !== formValue)
        : [...value, formValue];

      onChange(id, newValue.sort());
    }
  }

  render() {
    const {
      tabList,
      multi,
      value,
    } = this.props;

    return (
      <div className='tabPicker clearfix'>
        {tabList.map((tabOption) => (
          <span
            key={tabOption.value}
            className={classNames('tab', {
              active: multi
                ? (ensureValueIsArray(value).includes(tabOption.value))
                : (tabOption.value === (value || 0)),
            })}
            onClick={() => (
              this._onClickTabOption(tabOption.value)
            )}
          >{tabOption.label}
          </span>
        ))}
      </div>
    );
  }
}

export default FilterTabList;
