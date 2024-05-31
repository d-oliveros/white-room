import React from 'react';
import PropTypes from 'prop-types';
import Flex from '#client/components/Flex/Flex.js';
import Text from '#client/components/Text/Text.js';
import Separator from '#client/components/Separator/Separator.js';
import Box from '#client/components/Box/Box.js';

const DividerLine = ({
  text,
  textProps,
  alignItems,
  height,
}) => (
  <Flex
    justifyContent='center'
    alignItems={alignItems}
  >
    <Box width='85px' position='relative' top='14px'>
      <Separator style={{ height }} />
    </Box>
    <Box padding='0 10px'>
      <Text {...textProps}>
        {text}
      </Text>
    </Box>
    <Box width='85px' position='relative' top='14px'>
      <Separator />
    </Box>
  </Flex>
);

DividerLine.propTypes = {
  text: PropTypes.string.isRequired,
  textProps: PropTypes.object,
  alignItems: PropTypes.string,
  height: PropTypes.string,
};

DividerLine.defaultProps = {
  textProps: {
    size: '16',
    color: 'greyMonochrome',
    font: 'whitney',
    weight: '500',
  },
  alignItems: 'baseline',
  height: '1px',
};

export default DividerLine;
