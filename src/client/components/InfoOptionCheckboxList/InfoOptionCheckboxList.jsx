import React from 'react';
import PropTypes from 'prop-types';
import InfoOptionCheckbox from '#client/components/InfoOptionCheckbox/InfoOptionCheckbox.jsx';

export const CHECKBOX_LIST_LAYOUT_NO_WRAP = 'noGridWrap';
export const CHECKBOX_LIST_THEME_BULLET_GRID = 'bulletGrid';

class InfoOptionCheckboxList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    optionList: PropTypes.array.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.array,
      PropTypes.bool,
    ]),
  }

  static defaultProps = {
    value: [],
  }

  render() {
    const {
      optionList,
      onChange,
      value,
    } = this.props;

    const checkIfActive = (optionValue) => Array.isArray(value)
      ? value.includes(optionValue)
      : value === optionValue;

    return (
      <div>
        {optionList.map((option) => (
          <InfoOptionCheckbox
            collapseUnselected={Array.isArray(value) ? value.length > 0 : !!value}
            key={option.value}
            isActive={checkIfActive(option.value)}
            onClick={() => {
              onChange(option.value, value);
              if (option.onClick) {
                option.onClick();
              }
            }}
            theme={option.theme}
            tagTheme={option.tagTheme}
            tagContents={option.tagContents}
            title={option.label}
            description={option.description}
            footer={option.footer}
          />
        ))}
      </div>
    );
  }
}

export default InfoOptionCheckboxList;
