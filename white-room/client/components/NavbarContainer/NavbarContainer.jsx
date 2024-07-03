import React from 'react';
import PropTypes from 'prop-types';
import NativeAppBanner from '#client/components/NativeAppBanner/NativeAppBanner.jsx';

const NavbarContainer = ({
  children,
}) => {
  return (
    <div className='NavbarContainer'>
      <NativeAppBanner />
      {children}
    </div>
  );
};

NavbarContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NavbarContainer;
