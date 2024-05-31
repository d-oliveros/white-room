import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Box from '#client/components/Box/Box.js';
import './ErrorMessage.less';

export const ERROR_MESSAGE_THEME_ORANGE = 'ERROR_MESSAGE_THEME_ORANGE';
export const ERROR_MESSAGE_THEME_RED = 'ERROR_MESSAGE_THEME_RED';
const ERROR_MESSAGE_THEME_TO_CLASSNAME_MAPPING = {
  [ERROR_MESSAGE_THEME_ORANGE]: 'message-orange',
  [ERROR_MESSAGE_THEME_RED]: 'message-red',
};
const ERROR_MESSAGE_THEMES = Object.keys(ERROR_MESSAGE_THEME_TO_CLASSNAME_MAPPING);

const ErrorMessage = ({ children, theme, ..._styles }) => (
  <Box
    styleName={classnames(
      'formMessageError',
      ERROR_MESSAGE_THEME_TO_CLASSNAME_MAPPING[theme],
    )}
    {..._styles}
  >
    {children}
  </Box>
);

ErrorMessage.propTypes = {
  ...Box.propTypes,
  theme: PropTypes.oneOf(ERROR_MESSAGE_THEMES),
  children: PropTypes.node.isRequired,
};
export default ErrorMessage;
