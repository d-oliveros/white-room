import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Logo from '#base/view/components/Logo/Logo.jsx';
import Link from '#base/view/components/Link/Link.jsx';

class Navbar extends Component {
  static propTypes = {
    leftButton: PropTypes.node,
    rightButton: PropTypes.node,
    backButtonLink: PropTypes.string,
    secondaryRightButton: PropTypes.node,
    redirectLogoTo: PropTypes.string,
    disableRedirect: PropTypes.bool,
  };

  static defaultProps = {
    redirectLogoTo: '/feed',
  };

  render() {
    const {
      leftButton,
      rightButton,
      backButtonLink,
      secondaryRightButton,
      redirectLogoTo,
      disableRedirect,
    } = this.props;

    return (
      <div className='Navbar'>
        <div className='NavbarWrapper'>
          <div className='NavbarContainer'>
            <span className='link left'>
              {backButtonLink && (
                <Link to={backButtonLink}>
                  <span className='link back'>Back</span>
                </Link>
              )}
              {leftButton}
            </span>
            <Logo
              redirectTo={redirectLogoTo}
              disableRedirect={disableRedirect}
            />
            {secondaryRightButton && (
              <span
                className='link secondaryRight'
              >
                {secondaryRightButton}
              </span>
            )}
            <span
              className='link right'
            >
              {rightButton}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Navbar;
