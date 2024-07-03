import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './FormFieldTagList.less';

const FormFieldTagList = ({
  optionList,
  value,
  onChange,
}) => {
  const onClickOption = (option) => {
    if (value.includes(option.value)) {
      onChange(value.filter((val) => val !== option.value));
    }
    else {
      onChange([...value, option.value]);
    }
  };

  return (
    <div styleName='container'>
      {optionList.map((option) => (
        <span
          key={option.value}
          styleName={classnames('option', {
            isActive: value.includes(option.value),
          })}
          onClick={() => onClickOption(option)}
        >
          {option.label}
        </span>
      ))}
    </div>
  );
};

FormFieldTagList.propTypes = {
  optionList: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FormFieldTagList;
