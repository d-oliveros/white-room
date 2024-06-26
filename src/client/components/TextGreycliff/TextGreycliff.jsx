import React from 'react';

import Text from '#client/components/Text/Text.jsx';

const TextGreycliff = (props) => {
  return (
    <Text
      font='greycliff'
      {...props}
    />
  );
};

TextGreycliff.propTypes = Text.propTypes;

export default TextGreycliff;
