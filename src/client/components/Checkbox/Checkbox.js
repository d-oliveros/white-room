import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const CHECKBOX_THEME_INLINE = 'adobeInline';
export const CHECKBOX_THEME_INLINE_WRAP = 'adobeInlineWrap';
export const CHECKBOX_THEME_BOX = 'adobeBox';
export const CHECKBOX_LIST_THEME_ICON_BOX = 'adobeIconBox';

const Checkbox = ({
  className,
  children,
  isActive,
  disabled,
  onClick,
  icons,
  checkboxIconType,
  type,
  noBackgroundImage,
}) => {

  return (
    <div
      className={classNames('choice', className, type, checkboxIconType, {
        active: isActive,
        disabled: disabled,
        noBackgroundImage: noBackgroundImage,
      })}
      onClick={onClick}
    >
      { icons && <div
        className='iconMain'
        style={{ backgroundImage: isActive ? `url(${icons.active})` : `url(${icons.inactive})` }}
      /> }
      <span
        className={classNames('answerText', {
          active: isActive,
        })}
      >
        {children}
      </span>
    </div>
  );
};

Checkbox.propTypes = {
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  checkboxIconType: PropTypes.string,
  type: PropTypes.string,
  noBackgroundImage: PropTypes.bool,
};

Checkbox.defaultProps = {
  isActive: false,
  disabled: false,
  type: CHECKBOX_THEME_INLINE,
};

export default Checkbox;
