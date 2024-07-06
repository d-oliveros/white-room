import React from 'react';
import PropTypes from 'prop-types';

import Text from '#base/view/components/Text/Text.jsx';
import Box from '#base/view/components/Box/Box.jsx';
import Flex from '#base/view/components/Flex/Flex.jsx';

const TextSeparator = ({
  text = 'or',
}) => {
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

export default TextSeparator;
