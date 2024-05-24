import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import ButtonDeprecated from 'client/components/ButtonDeprecated/ButtonDeprecated';
import Button from 'client/components/Button/Button';
import DarkModal from 'client/components/DarkModal/DarkModal';
import ModalContent from 'client/components/ModalContent/ModalContent';
import Box from 'client/components/Box/Box';
import Text from 'client/components/Text/Text';
import SafariToolbarSpace from 'client/components/SafariToolbarSpace/SafariToolbarSpace';

import './SimpleMessageModal.less';

export const SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP = 'SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP';
const SIMPLE_MESSAGE_MODAL_THEME_TO_CLASSNAME_MAPPING = {
  [SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP]: 'simpleMessageModalThemeSlideUp',
};
const SIMPLE_MESSAGE_MODAL_THEMES = Object.keys(SIMPLE_MESSAGE_MODAL_THEME_TO_CLASSNAME_MAPPING);

const SimpleMessageModal = ({
  className,
  contentContainerClassName,
  iconUrl,
  headline,
  underline,
  message,
  buttonText,
  buttonTheme,
  buttonHref,
  subLabelText,
  sublabelClassName,
  showSubLabelDecoration,
  onSubLabelClick,
  onButtonClick,
  onClose,
  maxWidth,
  minWidth,
  maxIconWidth,
  maxIconHeight,
  multiButtons,
  srMultiButtons,
  customCtas,
  theme,
  innerStyle,
  useSafariToolbarSpace,
}) => (
  <DarkModal
    className={classnames('SimpleMessageModal', className)}
    onClose={onClose || (() => true)}
  >
    <span styleName={classnames(
      'modalContentContainer',
      theme ? SIMPLE_MESSAGE_MODAL_THEME_TO_CLASSNAME_MAPPING[theme] : null,
    )}
    >
      <ModalContent
        style={{
          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
          minWidth: minWidth ? `${minWidth}px` : undefined,
        }}
        innerStyle={innerStyle}
      >
        {onClose && (
          <div styleName='closeModalIcon' onClick={onClose} />
        )}
        <div styleName={classnames('contentContainer', contentContainerClassName, { noIcon: !iconUrl })}>
          {iconUrl && (
            <div
              style={{
                maxWidth: maxIconWidth ? `${maxIconWidth}px` : undefined,
                maxHeight: maxIconHeight ? `${maxIconHeight}px` : undefined,
              }}
              styleName='heroIcon'
            >
              <img
                styleName='heroIconImage'
                style={maxIconHeight ? {
                  height: `${maxIconHeight}px`,
                  maxHeight: `${maxIconHeight}px`,
                } : undefined}
                src={iconUrl}
                alt=''
              />
            </div>
          )}
          <div styleName='modalHeadline'>
            {headline}
          </div>
          {underline &&
            <img
              styleName='headerUnderline'
              alt='header underline'
              src='/images/yellow-underline.svg'
            />}
          <div styleName='modalMessage'>
            {message}
          </div>
          <div
            styleName={classnames('modalFooter', !message ? 'noMessage' : null)}
          >
            {multiButtons && multiButtons.map((button, index) => (
              <Box
                key={index} // eslint-disable-line react/no-array-index-key
                marginTop={index === 0 ? '0px' : '18px'}
              >
                <ButtonDeprecated
                  type='button'
                  theme={button.buttonTheme}
                  onClick={button.onButtonClick || button.onClose}
                  disabled={button.buttonDisabled}
                >
                  {button.buttonText}
                </ButtonDeprecated>
              </Box>
            ))}
            {srMultiButtons && srMultiButtons.map((button, index) => (
              <Box
                key={index} // eslint-disable-line react/no-array-index-key
                marginTop={index === 0 ? '0px' : '18px'}
              >
                <Button
                  type='button'
                  theme={button.buttonTheme}
                  onClick={button.onButtonClick || button.onClose}
                  disabled={button.buttonDisabled}
                  hasBoxShadow
                  {...button.buttonProps || {}}
                >
                  {button.buttonText}
                </Button>
              </Box>
            ))}
            {buttonText &&
              <ButtonDeprecated
                type='button'
                theme={buttonTheme}
                onClick={onButtonClick || onClose}
                href={buttonHref}
              >
                {buttonText}
              </ButtonDeprecated>}
            {subLabelText && (
              <div styleName={classnames('subLabelText', sublabelClassName)}>
                <Text
                  decoration={showSubLabelDecoration ? 'underline-yellow' : undefined}
                  onClick={onSubLabelClick}
                  className={onSubLabelClick ? 'cursor-pointer' : undefined}
                >
                  {subLabelText}
                </Text>
              </div>
            )}
            {(customCtas || []).map((node) => node)}
          </div>
        </div>
        {useSafariToolbarSpace && (
          <SafariToolbarSpace />
        )}
      </ModalContent>
    </span>
  </DarkModal>
);

SimpleMessageModal.propTypes = {
  className: PropTypes.string,
  contentContainerClassName: PropTypes.string,
  iconUrl: PropTypes.string,
  headline: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  underline: PropTypes.bool,
  message:  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  buttonText: PropTypes.string,
  buttonTheme: PropTypes.string,
  buttonHref: PropTypes.string,
  subLabelText: PropTypes.string,
  onButtonClick: PropTypes.func,
  sublabelClassName: PropTypes.string,
  showSubLabelDecoration: PropTypes.bool,
  onSubLabelClick: PropTypes.func,
  onClose: PropTypes.func,
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxIconWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiButtons: PropTypes.array,
  srMultiButtons: PropTypes.array,
  theme: PropTypes.oneOf(SIMPLE_MESSAGE_MODAL_THEMES),
  innerStyle: PropTypes.object,
  useSafariToolbarSpace: PropTypes.bool,
};

SimpleMessageModal.defaultProps = {
  showSubLabelDecoration: true,
};

export default SimpleMessageModal;
