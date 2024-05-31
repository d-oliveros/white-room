import React from 'react';
import PropTypes from 'prop-types';

import Text from '#client/components/Text/Text.js';

const NavbarTitle = ({ title }) => {
  return (
    <div className='NavbarTitle'>
      <div className='titleWrapper'>
        <Text font='whitney-sc' weight='bold' className='title'>
          {title}
        </Text>
      </div>
    </div>
  );
};

NavbarTitle.propTypes = {
  title: PropTypes.string.isRequired,
};

export default NavbarTitle;
