import React from 'react';
import PropTypes from 'prop-types';

const Separator = () => {
  return (
    <div className='Separator' />
  );
};

const inlineStyleProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

Separator.propTypes = {
  display: inlineStyleProp,
  marginTop: inlineStyleProp,
  marginBottom: inlineStyleProp,
};

export default Separator;
