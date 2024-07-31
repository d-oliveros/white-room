import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Box from '#app/view/components/Box/Box.jsx';
import Icon from '#app/view/components/Icon/Icon.jsx';

function _onModalContentClick(event) {
  event.stopPropagation();
}

function getWidthStyles(width) {
  if (!width) {
    return {};
  }
  return {
    width: `${width}px`,
  };
}

const ModalContent = ({
  onCloseIconClick,
  children,
  width,
  dynamicHeight,
  style,
  innerStyle,
}) => (
  <div
    className={classnames(
      'ModalContent',
      dynamicHeight && 'dynamicHeight',
    )}
    style={{ ...(style || {}), ...getWidthStyles(width) }}
    onClick={_onModalContentClick}
  >
    {onCloseIconClick && (
      <Box
        position='absolute'
        zIndex='9999'
        onClick={onCloseIconClick}
        className='closeButton'
      >
        <Icon className='x-close-large-white' />
      </Box>
    )}
    <div className='inner' style={innerStyle}>
      {children}
    </div>
  </div>
);

ModalContent.propTypes = {
  onCloseIconClick: PropTypes.func,
  children: PropTypes.node,
  width: PropTypes.number,
  dynamicHeight: PropTypes.bool,
  style: PropTypes.object,
  innerStyle: PropTypes.object,
};

export default ModalContent;
