import React from 'react';
import PropTypes from 'prop-types';
import { useMediaQuery } from 'react-responsive';

import { MEDIA_QUERY_SMALL_SCREEN } from '#white-room/client/constants/mediaQueries.js';

import Button, {
  BUTTON_THEME_ADOBE_GREEN,
  BUTTON_HEIGHT_MEDIUM,
} from '#base/view/components/Button/Button.jsx';

const FooterSaveButton = ({
  isSubmitting,
  buttonText,
  onClick,
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
      hasBoxShadow
      disabled={isSubmitting}
      type={type}
      onClick={onClick}
    >
      {buttonText || (isSubmitting ? 'Saving...' : 'Save')}
    </Button>
  );
};

FooterSaveButton.propTypes = {
  onClick: PropTypes.func,
  type: PropTypes.string,
  isSubmitting: PropTypes.bool,
  buttonText: PropTypes.string,
};

export default FooterSaveButton;
