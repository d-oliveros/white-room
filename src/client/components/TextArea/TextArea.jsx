import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const TextArea = ({
  className = '',
  placeholder,
  onChange,
  value,
}) => (
  <textarea
    className={classnames('textarea', className)}
    placeholder={placeholder}
    onChange={onChange}
    value={value}
  />
);

TextArea.propTypes = {
  className: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

export default TextArea;
