import React from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from 'react-responsive';

import {
  MEDIA_QUERY_SMALL_SCREEN,
} from '#client/constants/mediaQueries.js';

import Button, {
  BUTTON_THEME_ADOBE_GREEN,
  BUTTON_HEIGHT_MEDIUM,
} from '#client/components/Button/Button.jsx';

const FooterButton = ({
  hasBoxShadow = false,
  disabled = false,
  onClick = null,
  children,
  type = 'submit',
}) => {
  const isSmallScreen = useMediaQuery({
    query: MEDIA_QUERY_SMALL_SCREEN,
  });

  return (
    <Button
      theme={BUTTON_THEME_ADOBE_GREEN}
      minWidth={isSmallScreen ? '100%' : '130px'}
      heightType={BUTTON_HEIGHT_MEDIUM}
      type={type}
      hasBoxShadow={hasBoxShadow}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

FooterButton.propTypes = {
  hasBoxShadow: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default FooterButton;
