import React from 'react';
import PropTypes from 'prop-types';

import Text from '#client/components/Text/Text.js';
import Box from '#client/components/Box/Box.js';
import Flex from '#client/components/Flex/Flex.js';

const TextSeparator = ({ text }) => {
  return (
    <Box margin='18px 0 0 0'>
      <Flex align='center' justify='center'>
        <Box width='100%' height='1px' backgroundColor='rgba(123, 132, 136, 0.12)' />
        <Box margin='0 14px'>
          <Text
            color='blue'
            font='greycliff'
            fontSize='13px'
            lineHeight='16px'
            opacity='0.5'
            weight='600'
            align='center'
            letterSpacing='0.41px'
          >
            { text }
          </Text>
        </Box>
        <Box width='100%' height='1px' backgroundColor='rgba(123, 132, 136, 0.12)' />
      </Flex>
    </Box>
  );
};

TextSeparator.propTypes = {
  text: PropTypes.string,
};

TextSeparator.defaultProps = {
  text: 'or',
};

export default TextSeparator;
