import React from 'react';
import PropTypes from 'prop-types';

import Box from 'client/components/Box/Box';
import Text from 'client/components/Text/Text';
import Icon from 'client/components/Icon/Icon';

const InfoSimpleChecklist = ({
  title,
  listItems,
}) => (
  <Box
    borderRadius='7px'
    backgroundColor='rgba(246, 247, 247, 0.8)'
    padding='16px 18px'
  >
    <Text
      font='greycliff'
      size='16'
      weight='800'
      lineHeight='19px'
      color='blueGreycliff'
      display='block'
    >
      {title}
    </Text>
    {listItems.map((listItem) => (
      <Box marginTop='8px'>
        <Box marginRight='12px' display='inlineBlock'>
          <Icon className='checkmark-rounded-blue' />
        </Box>
        <Text
          font='greycliff'
          size='16'
          weight='600'
          lineHeight='24px'
          color='blueGreycliff'
        >
          {listItem}
        </Text>
      </Box>
    ))}
  </Box>
);

InfoSimpleChecklist.propTypes = {
  title: PropTypes.string.isRequired,
  listItems: PropTypes.array.isRequired,
};

export default InfoSimpleChecklist;
