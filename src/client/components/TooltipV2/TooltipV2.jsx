import React from 'react';
import PropTypes from 'prop-types';

import Box from '#client/components/Box/Box.jsx';
import Text from '#client/components/Text.jsx';

export const TOOLTIP_V2_DIRECTION_RIGHT = 'right';
export const TOOLTIP_V2_DIRECTION_LEFT = 'left/Text';

const TOOLTIP_V2_DIRECTIONS = [
  TOOLTIP_V2_DIRECTION_RIGHT,
  TOOLTIP_V2_DIRECTION_LEFT,
];

const TooltipV2 = ({
  color,
  text,
  direction,
}) => (
  <>
    <Box
      backgroundColor={color}
      display='inlineBlock'
      borderRadius='14px'
      padding='11px 13px'
    >
      <Text
        color='white'
        font='greycliff'
        size='16'
        weight='800'
        lineHeight='26px'
        display='block'
      >
        {text}
      </Text>
      <img
        alt='tooltip-arrow'
        src='/images/tooltip-triangle-blue.svg'
        style={{
          margin: direction === TOOLTIP_V2_DIRECTION_RIGHT ? '5px 20px -24px auto' : '5px auto -24px 20px',
          display: 'block',
          width: '25px',
          height: '18px',
        }}
      />
    </Box>
  </>
);

TooltipV2.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string.isRequired,
  direction: PropTypes.oneOf(TOOLTIP_V2_DIRECTIONS),
};

TooltipV2.defaultProps = {
  color: '#007AFF',
  direction: TOOLTIP_V2_DIRECTION_LEFT,
};

export default TooltipV2;
