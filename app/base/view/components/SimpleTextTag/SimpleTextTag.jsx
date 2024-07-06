import React from 'react';
import PropTypes from 'prop-types';

import Box from '#base/view/components/Box/Box.jsx';
import Text from '#base/view/components/Text/Text.jsx';

const SimpleTextTag = ({
  title,
  value,
  color,
}) => (
  <Box
    borderRadius='14px'
    backgroundColor={color}
    padding='16px 18px 18px'
  >
    <Text
      font='greycliff'
      size='16'
      weight='700'
      lineHeight='21px'
      color='blueGreycliff'
      display='block'
      align='center'
    >
      {title}
    </Text>
    <Box marginTop='8px'>
      <Text
        font='greycliff'
        size='30'
        weight='800'
        lineHeight='25px'
        color='blueGreycliff'
        display='block'
        align='center'
      >
        {value}
      </Text>
    </Box>
  </Box>
);

SimpleTextTag.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  color: PropTypes.string,
};

SimpleTextTag.defaultProps = {
  color: '#f1f1f1',
};

export default SimpleTextTag;
