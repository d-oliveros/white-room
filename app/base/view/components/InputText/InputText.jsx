import React from 'react';
import PropTypes from 'prop-types';

const InputText = ({
  placeholder,
  type,
  onChange,
  value,
  name,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    onChange={onChange}
    value={value}
    name={name}
  />
);

InputText.propTypes = {
  placeholder: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default InputText;
