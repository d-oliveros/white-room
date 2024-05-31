import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useMediaQuery } from 'react-responsive';

import { MEDIA_QUERY_SMALL_SCREEN } from '#client/constants/mediaQueries';

import Tag, {
  TAG_THEMES,
} from '#client/components/Tag/Tag.jsx';

import './InfoOptionCheckbox.less';

import Box from '#client/components/Box/Box.jsx';
import Flex from '#client/components/Flex/Flex.jsx';
import Text from '#client/components/Text/Text.jsx';

export const INFO_OPTION_CHECKBOX_THEME_ADOBE_BOLD = 'INFO_OPTION_CHECKBOX_THEME_ADOBE_BOLD';
export const INFO_OPTION_CHECKBOX_THEME_ADOBE_UP = 'INFO_OPTION_CHECKBOX_THEME_ADOBE_UP';

export const INFO_OPTION_CHECKBOX_THEME_TO_CLASSNAME_MAPPING = {
  [INFO_OPTION_CHECKBOX_THEME_ADOBE_BOLD]: 'themeAdobeBold',
  [INFO_OPTION_CHECKBOX_THEME_ADOBE_UP]: 'themeAdobeUp',
};
export const INFO_OPTION_CHECKBOX_THEMES = Object.keys(INFO_OPTION_CHECKBOX_THEME_TO_CLASSNAME_MAPPING);

const InfoOptionCheckbox = ({
  isActive,
  theme,
  tagTheme,
  title,
  tagContents,
  onClick,
  description,
  collapseUnselected,
  footer,
}) => {
  const isSmallScreen = useMediaQuery({
    query: MEDIA_QUERY_SMALL_SCREEN,
  });

  return (
    <div styleName={
      classnames(
        'containerWrapper',
        { isActive },
        INFO_OPTION_CHECKBOX_THEME_TO_CLASSNAME_MAPPING[theme],
      )}
    >
      <div onClick={onClick} styleName='container'>
        <Flex justify='start' align='center'>
          <img
            styleName='checkboxIcon'
            alt='checkbox icon'
            src={isActive
              ? '/images/checkmark-circle-green.svg'
              : '/images/circle-small-grey.svg'
            }
          />
          <div styleName='titleContainer'>
            <Text
              color='blueGreycliff'
              font='greycliff'
              fontSize='18px'
              lineHeight='22px'
              weight='800'
            >
              {title}
            </Text>
          </div>
          {tagContents && (
            <Tag theme={tagTheme}>
              {tagContents}
            </Tag>
          )}
        </Flex>
        {(!collapseUnselected || isActive) && description && (
          <Box marginTop='6px' marginBottom='10px' maxWidth={isSmallScreen ? null : 'calc(100% - 160px)'}>
            <Text
              display='block'
              font='greycliff'
              color='blueGreycliff'
              fontSize='13px'
              lineHeight='18px'
              weight='600'
            >
              {description}
            </Text>
          </Box>
        )}
      </div>
      {footer && (
        <div styleName='footer'>
          {footer}
        </div>
      )}
    </div>
  );
};

InfoOptionCheckbox.propTypes = {
  isActive: PropTypes.bool,
  tagContents: PropTypes.string,
  tagTheme: PropTypes.oneOf(TAG_THEMES),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  theme: PropTypes.oneOf(INFO_OPTION_CHECKBOX_THEMES),
  onClick: PropTypes.func,
  description: PropTypes.string,
  collapseUnselected: PropTypes.bool,
  footer: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

InfoOptionCheckbox.defaultProps = {
  theme: INFO_OPTION_CHECKBOX_THEME_ADOBE_BOLD,
};

InfoOptionCheckbox.displayName = 'InfoOptionCheckbox';

export default InfoOptionCheckbox;
