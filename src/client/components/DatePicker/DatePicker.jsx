import React, { Component } from 'react';
import dayjs from 'dayjs';
import Datetime from 'react-datetime';
import lodashIsEqual from 'lodash/fp/isEqual.js';
import isValidDateWithoutTimeString from '#common/util/isValidDateWithoutTimeString.js';
import dateStringMomentWithCurrentTime from '#common/util/dateStringMomentWithCurrentTime.js';

const onlyUpdateOnPropChangeNames = [
  'value',
  'className',
  'isValidDate',
  'closeOnSelect',
  'placeholderValue',
  'placeholder',
  'viewMode',
  'dateFormat',
  'timeFormat',
  'disabled',
  'readOnly',
  'name',
];

const renderDaysInWeek = (props, currentDate, selectedDate) => {
  if (selectedDate) {
    const initialDate = selectedDate;
    const finalDate = dayjs(selectedDate).add(6, 'days');
    const shouldHighlight = currentDate.isBetween(
      initialDate,
      finalDate,
      'days',
      '[]'
    );

    const highlightedProps = {
      ...props,
      className: 'rdtDay rdtActive',
    };

    if (shouldHighlight) {
      return <td {...highlightedProps}>{currentDate.date()}</td>;
    }
  }

  return <td {...props}>{currentDate.date()}</td>;
};

const renderDay = (props, currentDate) => {
  return <td {...props}>{currentDate.date()}</td>;
};

class DatePicker extends Component {
  static defaultProps = {
    timeFormat: false,
    dateFormat: true,
  }

  shouldComponentUpdate(nextProps) {
    const propsChanged = onlyUpdateOnPropChangeNames.some((propName) => (
      this.props[propName] !== nextProps[propName]
    ));
    const onChangeChanged = (
      !nextProps.skipOnChangeReRender
      && this.props.onChange !== nextProps.onChange
    );

    const onFormikBagChanged = !lodashIsEqual(this.props.formikBag?.values, nextProps.formikBag?.values);

    return propsChanged || onChangeChanged || onFormikBagChanged;
  }

  render() {
    const {
      className,
      onChange,
      isValidDate,
      closeOnSelect,
      placeholderValue,
      placeholder,
      viewMode,
      dateFormat,
      timeFormat,
      disabled,
      readOnly = true,
      name,
      selection,
    } = this.props;

    let { value } = this.props;

    if (isValidDateWithoutTimeString(value)) {
      value = dateStringMomentWithCurrentTime(value);
    }

    return (
      <Datetime
        inputProps={{
          className,
          placeholder,
          disabled,
          readOnly,
          name,
        }}
        timeFormat={timeFormat}
        dateFormat={dateFormat}
        viewMode={viewMode}
        onChange={onChange}
        isValidDate={isValidDate}
        value={value && typeof value === 'string'
          ? new Date(value)
          : (value && dayjs(value).isValid()
            ? dayjs(value).toDate()
            : placeholderValue
          )
        }
        closeOnSelect={closeOnSelect}
        renderDay={
          selection === 'weekly'
            ? renderDaysInWeek
            : renderDay
        }
      />
    );
  }
}

export default DatePicker;
