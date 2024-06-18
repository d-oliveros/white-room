import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export const SIMPLE_DROPDOWN_THEME_V2 = 'SIMPLE_DROPDOWN_THEME_V2';
const SIMPLE_DROPDOWN_THEME_TO_CLASSNAME_MAPPING = {
  [SIMPLE_DROPDOWN_THEME_V2]: 'v2',
};

class SimpleDropdown extends Component {
  static propTypes = {
    theme: PropTypes.oneOf([
      SIMPLE_DROPDOWN_THEME_V2,
    ]),
    title: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.node.isRequired,
    ]),
    subtitle: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      title: PropTypes.node.isRequired,
      isActive: PropTypes.bool,
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
    footer: PropTypes.node,
  }

  static defaultProps = {
    multiple: false,
  }

  _handleCheckboxToggle = (clickedOptionId) => {
    this.props.onChange(clickedOptionId);
  }

  render() {
    const {
      theme,
      title,
      subtitle,
      options,
      multiple,
      footer,
    } = this.props;

    return (
      <div
        className={classnames(
          'SimpleDropdown',
          SIMPLE_DROPDOWN_THEME_TO_CLASSNAME_MAPPING[theme],
        )}
      >
        <span className='title'>
          {title}
          {subtitle && (
            <span className='subtitle'>{subtitle}</span>
          )}
        </span>

        <div className='dropdownContainer'>
          {options.map((option) => (
            <span
              key={`${option.id}`}
              className={classnames('option', { active: option.isActive, multiple: multiple })}
              onClick={() => this._handleCheckboxToggle(option.id)}
            >
              {option.title}
            </span>
          ))}
          {footer}
        </div>
      </div>

    );
  }
}

export default SimpleDropdown;
