import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const ICON_DISPLAY_TO_CLASSNAME_MAPPING = {
  inlineBlock: 'display-inline-block',
};

const ICON_CURSOR_TO_CLASSNAME_MAPPING = {
  pointer: 'cursor-pointer',
};

const Icon = ({ display, cursor, className }) => {
  return (
    <div
      className={classnames(
        'Icon',
        ICON_DISPLAY_TO_CLASSNAME_MAPPING[display],
        ICON_CURSOR_TO_CLASSNAME_MAPPING[cursor],
        className,
      )}
    />
  );
};

const inlineStyleProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

Icon.propTypes = {
  display: PropTypes.oneOf(Object.keys(ICON_DISPLAY_TO_CLASSNAME_MAPPING)),
  cursor: PropTypes.oneOf(Object.keys(ICON_CURSOR_TO_CLASSNAME_MAPPING)),
  className: PropTypes.string.isRequired,
  marginLeft: inlineStyleProp,
  marginRight: inlineStyleProp,
  marginTop: inlineStyleProp,
  marginBottom: inlineStyleProp,
};

export default Icon;
