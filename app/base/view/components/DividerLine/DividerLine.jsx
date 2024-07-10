import React from 'react';
import PropTypes from 'prop-types';
import Flex from '#base/view/components/Flex/Flex.jsx';
import Text from '#base/view/components/Text/Text.jsx';
import Separator from '#base/view/components/Separator/Separator.jsx';
import Box from '#base/view/components/Box/Box.jsx';

const DividerLine = ({
  text,
  textProps = {
    size: '16',
    color: 'greyMonochrome',
    font: 'whitney',
    weight: '500',
  },
  alignItems = 'baseline',
  height = '1px',
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

export default DividerLine;
