import React from 'react';

export default class PasswordReset extends React.Component {
  static getPageMetadata() {
    return {
      pageTitle: 'White Room - Password Reset',
      robots: 'noindex'
    };
  }

  render() {
    return (
      <div>
        <p>Password reset</p>
      </div>
    );
  }
}
