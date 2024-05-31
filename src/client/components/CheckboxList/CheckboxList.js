import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import lodashTimes from 'lodash/fp/times.js';
import Checkbox, {
  CHECKBOX_THEME_INLINE,
  CHECKBOX_LIST_THEME_ICON_BOX,
} from '#client/components/Checkbox/Checkbox.js';

export const CHECKBOX_LIST_LAYOUT_NO_WRAP = 'noGridWrap';
export const CHECKBOX_LIST_THEME_BULLET_GRID = 'bulletGrid';

class CheckboxList extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    optionList: PropTypes.array.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.array,
      PropTypes.bool,
    ]),
    multipleSelection: PropTypes.bool,
    useArrayValues: PropTypes.bool,
    allowEmptyArray: PropTypes.bool,
    toggleSingleSelection: PropTypes.bool,
    uncheckedValue: PropTypes.bool,
    fieldType: PropTypes.string,
    autoFitWidth: PropTypes.string,
    checkboxIconType: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    checkboxClassName: PropTypes.string,
    columns: PropTypes.number,
    width: PropTypes.string,
    gridGap: PropTypes.string,
  }

  static defaultProps = {
    value: [],
    multipleSelection: true,
    useArrayValues: false,
    allowEmptyArray: true,
    fieldType: CHECKBOX_THEME_INLINE,
  }

  _onChangeCheckbox = (formValue) => {
    const {
      onChange,
      value,
      multipleSelection,
      useArrayValues,
      allowEmptyArray,
      toggleSingleSelection,
      uncheckedValue = false,
    } = this.props;

    if (!multipleSelection && !useArrayValues) {
      onChange(value === formValue && toggleSingleSelection
        ? uncheckedValue
        : formValue);
      return;
    }
    if (!multipleSelection && useArrayValues) {
      const newValue = value.includes(formValue) ? [] : [formValue];
      if (!allowEmptyArray && !newValue.length) {
        return;
      }
      onChange(newValue.sort());
      return;
    }

    const newValue = value.includes(formValue)
      ? value.filter((val) => val !== formValue)
      : [...value, formValue];

    if (!allowEmptyArray && !newValue.length) {
      return;
    }

    onChange(newValue.sort());
  }

  render() {
    const {
      optionList,
      value,
      multipleSelection,
      useArrayValues,
      disabled,
      fieldType,
      autoFitWidth,
      checkboxIconType,
      className,
      checkboxClassName,
      columns,
      width,
      gridGap,
    } = this.props;

    return (
      <div
        className={classnames(
          className,
          (fieldType === CHECKBOX_LIST_THEME_ICON_BOX && optionList.length <= 2) ?
            CHECKBOX_LIST_LAYOUT_NO_WRAP : CHECKBOX_LIST_THEME_BULLET_GRID,
        )}
        style={{
          gridTemplateColumns: autoFitWidth
            ? `repeat(auto-fit, minmax(${autoFitWidth}, ${autoFitWidth}))`
            : columns
              ? lodashTimes(() => '1fr', columns).join(' ')
              : null,
          width,
          gridGap,
        }}
      >
        {optionList.map((option) => (
          <Checkbox
            key={option.value}
            isActive={value && (multipleSelection || useArrayValues)
              ? value.includes(option.value)
              : value === option.value
            }
            disabled={disabled || option.disabled}
            onClick={() => {
              this._onChangeCheckbox(option.value);
            }}
            icons={fieldType === CHECKBOX_LIST_THEME_ICON_BOX ? {
              active: option.activeIconUrl,
              inactive: option.iconUrl,
            } : null}
            type={fieldType}
            checkboxIconType={checkboxIconType}
            noBackgroundImage={option.noBackgroundImage}
            className={checkboxClassName}
          >
            <span>
              {option.label}
            </span>
            {option.sublabel && (
              <span className='sublabel'>{option.sublabel}</span>
            )}
          </Checkbox>
        ))}
      </div>
    );
  }
}

export default CheckboxList;
