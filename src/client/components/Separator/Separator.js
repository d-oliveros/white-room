import React from 'react';
import PropTypes from 'prop-types';

import { system as styledSystem } from '@styled-system/core';

const styledParser = styledSystem({
  display: true,
  marginTop: true,
  marginBottom: true,
  opacity: true,
  backgroundColor: true,
});

const Separator = ({ ..._styles }) => {
  const style = styledParser(_styles);
  return (
    <div style={style} className='Separator' />
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
