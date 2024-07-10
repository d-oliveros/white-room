/* eslint-disable react/jsx-no-target-blank */
import React from 'react';
import PropTypes from 'prop-types';

import Box from '#base/view/components/Box/Box.jsx';
import Text from '#base/view/components/Text/Text.jsx';
import Flex from '#base/view/components/Flex/Flex.jsx';

const InformationLabel = ({
  text,
}) => (
  <Box borderRadius='8px' backgroundColor='#f1f1f1' padding='16px'>
    <Flex>
      <img
        alt='information'
        src='/images/information-icon-yellow.svg'
        width='22px'
        height='22px'
        style={{
          filter: 'drop-shadow(0px 4px 7px rgba(234, 188, 3, 0.26))',
          marginRight: '16px',
          marginTop: '4px',
          flexShrink: '0',
        }}
      />
      <Text
        font='greycliff'
        color='blueGreycliff'
        weight='700'
        size='14'
        lineHeight='20px'
      >
        {text}
      </Text>
    </Flex>
  </Box>
);

InformationLabel.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
};

export default InformationLabel;
