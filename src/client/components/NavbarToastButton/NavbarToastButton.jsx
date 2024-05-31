import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NavbarToastButton extends Component {
  static propTypes = {
    buttonContent: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
    ]).isRequired,
  };

  render() {
    const {
      buttonContent,
    } = this.props;

    return (
      <div
        className='navbar-toast-link'
      >
        <span className='container'>
          {buttonContent}
        </span>
      </div>
    );
  }
}

export default NavbarToastButton;
