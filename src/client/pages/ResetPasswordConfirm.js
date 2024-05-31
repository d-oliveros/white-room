import React, { Component } from 'react';
import PropTypes from 'prop-types';

import parseQueryString from '#common/util/parseQueryString.js';
import { SCREEN_ID_RESET_PASSWORD_CONFIRM } from '#client/constants/screenIds';

import { getUserLandingPage } from '#client/helpers/allowedRoles';

import branch from '#client/core/branch.js';
import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';

import PasswordResetConfirmForm from '#client/components/PasswordResetConfirmForm/PasswordResetConfirmForm.js';
import Navbar from '#client/components/Navbar/Navbar.js';
import Link from '#client/components/Link/Link.js';

import AuthActions from '#client/actions/Auth.js';

@withTransitionHook
@branch({
  isMobileApp: ['mobileApp', 'isMobileApp'],
})
@withScreenId(SCREEN_ID_RESET_PASSWORD_CONFIRM)
@withScrollToTop
class ResetPasswordConfirmPage extends Component {
  static getPageMetadata = (state) => ({
    pageTitle: state.get(['env', 'APP_TITLE']),
    keywords: `${state.get(['env', 'APP_ID'])}, reset password`,
    description: 'Reset your password.',
  })

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    isMobileApp: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.redirectUser = this.redirectUser.bind(this);
  }

  onPasswordResetConfirmFormSubmit = (formValues) => {
    const { dispatch, location } = this.props;
    const { token } = parseQueryString(location.search);

    dispatch(AuthActions.resetPasswordRequested, {
      token: token,
      password: formValues.password,
    })
      .then(({ user }) => this.redirectUser(user));
  }

  async redirectUser(user) {
    const { history, isMobileApp } = this.props;

    const userLandingPage = getUserLandingPage({
      userRoles: user.roles,
      isMobileApp: isMobileApp,
    });
    history.push(userLandingPage);
  }

  render() {
    const { location } = this.props;

    return (
      <div className='page-reset-password'>
        <Navbar
          redirectLogoTo='/'
          leftButton={
            <Link
              className='link back'
              redirectToLastLocation
              restoreScrollPosition
              to='/reset-password-verify-code'
            >
              Back
            </Link>
          }
        />
        <div className='resetContainer'>
          <div className='resetFormContainer'>
            <PasswordResetConfirmForm
              onSubmit={this.onPasswordResetConfirmFormSubmit}
              locationQuery={queryString.parse(location.search)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPasswordConfirmPage;
