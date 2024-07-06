import React, { Fragment, useEffect } from 'react';
import { Portal } from 'react-portal';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useMediaQuery } from 'react-responsive';

import Box from '#base/view/components/Box/Box.jsx';
import Flex from '#base/view/components/Flex/Flex.jsx';
import Button, {
  BUTTON_THEME_BLUR,
} from '#base/view/components/Button/Button.jsx';

import './ModalV2.less';

export const MODAL_THEME_SLIDE_UP = 'MODAL_THEME_SLIDE_UP';
export const MODAL_THEME_FIXED_FOOTER_BUTTON = 'MODAL_THEME_FIXED_FOOTER_BUTTON';
export const MODAL_THEME_FIXED_FOOTER_BUTTON_PREVIEW_DOCS = 'MODAL_THEME_FIXED_FOOTER_BUTTON_PREVIEW_DOCS';
export const MODAL_THEME_FIXED_FOOTER_BUTTON_SLIDE_UP = 'MODAL_THEME_FIXED_FOOTER_BUTTON_SLIDE_UP';
export const MODAL_THEME_STACK = 'MODAL_THEME_STACK';
const MODAL_THEME_TO_CLASSNAME_MAPPING = {
  [MODAL_THEME_SLIDE_UP]: 'slideUp',
  [MODAL_THEME_FIXED_FOOTER_BUTTON]: 'fixedFooterButton',
  [MODAL_THEME_FIXED_FOOTER_BUTTON_PREVIEW_DOCS]: 'fixedFooterButtonPreviewDocs',
  [MODAL_THEME_FIXED_FOOTER_BUTTON_SLIDE_UP]: 'fixedFooterButtonSlideUp',
  [MODAL_THEME_STACK]: 'stack',
};
const MODAL_THEMES = Object.keys(MODAL_THEME_TO_CLASSNAME_MAPPING);

const ModalV2 = ({
  className,
  children,
  onClose,
  showCloseButton = true,
  closeOnBackgroundClick = false,
  contentMaxWidth = '895px',
  contentMaxHeight,
  contentHeight,
  contentPadding,
  contentBorderRadius,
  contentStyle,
  centerContent,
  theme,
  buttonTheme = BUTTON_THEME_BLUR,
  buttonText = 'Close',
  buttonProps,
  buttonContainerProps = { gap: '10px' },
  disableAnimation = false,
  contentOverflow = 'auto',
  overflow = 'auto',
  padding = '8vh 0 0 0',
  margin = '5vh auto 0 auto',
  zIndex,
}) => {
  const isSmallScreen = useMediaQuery({
    query: `(max-device-width: ${contentMaxWidth})`,
  });

  useEffect(() => {
    global.document.body.classList.add('overflow-hidden');

    return () => {
      global.document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <Portal>
      <div
        className={className}
        styleName={classnames('ModalV2', { centerContent }, MODAL_THEME_TO_CLASSNAME_MAPPING[theme])}
        style={{ padding, overflow, zIndex }}
      >
        <div
          styleName={classnames('contentContainer', { disableAnimation })}
          style={{
            height: contentHeight,
            maxWidth: contentMaxWidth || null,
            maxHeight: (!isSmallScreen && contentMaxHeight) || null,
            padding: contentPadding,
            margin: margin,
            position: closeOnBackgroundClick ? 'relative' : null,
            overflow: contentOverflow,
            borderRadius: contentBorderRadius,
            ...(contentStyle || {}),
          }}
        >
          {children}
        </div>
        {showCloseButton &&
        <div
          styleName='closeButton'
          style={{
            width: theme === MODAL_THEME_FIXED_FOOTER_BUTTON && contentMaxWidth
              ? isSmallScreen
                ? '100%'
                : contentMaxWidth : null,
            left: theme === MODAL_THEME_FIXED_FOOTER_BUTTON && contentMaxWidth
              ? isSmallScreen
                ? '0px'
                : `calc((100vw - ${contentMaxWidth}) / 2)` : null,
          }}
        >
          {buttonProps ?
            <Flex {...buttonContainerProps}>
              {buttonProps.map((button, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={index}>
                  <Button
                    onClick={button.onClick}
                    theme={button.theme}
                    disabled={button.disabled}
                    minWidth={button.minWidth || 'calc((100% - 10px) / 2)'}
                    margin={button.margin}
                  >
                    {button.text}
                  </Button>
                </Fragment>
              ))}
            </Flex> : (
              <Button
                onClick={onClose}
                theme={buttonTheme}
              >
                {buttonText}
              </Button>
            )
          }
        </div>
        }
        {closeOnBackgroundClick &&
        <Box
          width='100%'
          height='100%'
          position='fixed'
          top='0'
          left='0'
          onClick={onClose}
          cursor='pointer'
          className='modalCloseBackground'
        />
        }
      </div>
    </Portal>
  );
};

ModalV2.propTypes = {
  children: PropTypes.node,
  closeOnBackgroundClick: PropTypes.bool,
  contentMaxWidth: PropTypes.string,
  contentHeight: PropTypes.string,
  contentMaxHeight: PropTypes.string,
  contentPadding: PropTypes.string,
  contentOverflow: PropTypes.string,
  contentBorderRadius: PropTypes.string,
  theme: PropTypes.oneOf(MODAL_THEMES),
  showCloseButton: PropTypes.bool,
  disableAnimation: PropTypes.bool,
  centerContent: PropTypes.bool,
  buttonTheme: PropTypes.string,
  buttonText: PropTypes.string,
  buttonContainerProps: PropTypes.object,
  overflow: PropTypes.string,
  padding: PropTypes.string,
  margin: PropTypes.string,
  onClose: PropTypes.func,
};

export default ModalV2;
