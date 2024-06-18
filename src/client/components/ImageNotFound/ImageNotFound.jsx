import React from 'react';
import Box from '#client/components/Box/Box.jsx';
import Text from '#client/components/Text/Text.jsx';

const ImageNotFound = () => (
  <Box
    width='100%'
    height='100%'
    position='relative'
    backgroundColor='#8A8A8A'
    borderRadius='14px'
    display='flex'
    flexDirection='row'
    flexWrap='wrap'
    justifyContent='center'
    alignItems='center'
  >
    <Box
      width='240px'
      height='120px'
      backgroundImage='url(/images/photo-not-found.svg)'
      backgroundPosition='center 20px'
      backgroundRepeat='no-repeat'
      position='relative'
    >
      <Box
        position='relative'
        top='55px'
        left='60px'
      >
        <Text font='greycliff' size='16' weight='bold' color='white'>
          Photo not found
        </Text>
      </Box>
    </Box>
  </Box>
);

export default ImageNotFound;
