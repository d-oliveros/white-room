import React from 'react';
import PropTypes from 'prop-types';
import Link from '#client/components/Link/Link.jsx';
import Text from '#client/components/Text/Text.jsx';
import Flex from '#client/components/Flex/Flex.jsx';
import Box from '#client/components/Box/Box.jsx';

const CardLink = ({ to, thumbnailUrl, title, label, sublabel }) => {
  return (
    <Box
      className='CardLink'
      position='relative'
      boxShadow='0px 9px 18px rgba(25, 51, 64, 0.07)'
      backgroundColor='#FFFFFF'
      padding='15px'
      marginBottom='7px'
      borderRadius='14px'
    >
      <Link to={to}>
        <Flex>
          <Box paddingRight='10px'>
            <img
              width='80'
              height='75'
              alt={thumbnailUrl}
              src={thumbnailUrl}
              style={{ borderRadius: '7px' }}
              className='dropshadow-bottom-edge'
            />
          </Box>
          <Flex justify='between' direction='col' className='width-100'>
            {title && (
              <Text
                size='larger'
                weight='bolder'
                display='block'
                font='greycliff'
                paddingRight='25px'
              >
                {title}
              </Text>
            )}
            {label && (
              <Text
                size='medium'
                weight='medium'
                display='block'
                font='greycliff'
                paddingTop='2px'
                className='ellipsis-25'
              >
                {label}
              </Text>
            )}
            {sublabel && (
              <Text
                size='medium'
                weight='medium'
                color='green'
                display='block'
                font='greycliff'
              >
                {sublabel}
              </Text>
            )}
          </Flex>
        </Flex>
        <Box position='absolute' right='15px' top='20px'>
          <img
            width='7px'
            height='10px'
            src='/images/arrow-small-right-blue-curved.svg'
            alt='icon'
          />
        </Box>
      </Link>
    </Box>
  );
};

CardLink.propTypes = {
  to: PropTypes.string.isRequired,
  thumbnailUrl: PropTypes.string,
  title: PropTypes.string,
  label: PropTypes.string,
  sublabel: PropTypes.string,
};

export default CardLink;
