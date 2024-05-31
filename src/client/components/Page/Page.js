import React from 'react';
import PropTypes from 'prop-types';
import Navbar from '#client/components/Navbar/Navbar.js';

const Page = ({
  navbarProps,
  children,
}) => (
  <div className='Page'>
    <Navbar {...navbarProps} />
    <div className='PageContent'>
      {children}
    </div>
  </div>
);

Page.propTypes = {
  navbarProps: PropTypes.object,
  children: PropTypes.node.isRequired,
};

export default Page;
