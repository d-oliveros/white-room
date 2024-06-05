import React from 'react';
import PropTypes from 'prop-types';

import parseQueryString from '#common/util/parseQueryString.js';
import { SCREEN_ID_RESET_PASSWORD_CONFIRM } from '#client/constants/screenIds';

import { getUserLandingPage } from '#client/helpers/allowedRoles';

import useTransitionHook from '#client/helpers/useTransitionHook.js';
import useScreenId from '#client/helpers/useScreenId.js';
import useScrollToTop from '#client/helpers/useScrollToTop.js';
import useBranch from '#client/core/useBranch.js';

import PasswordResetConfirmForm from '#client/components/PasswordResetConfirmForm/PasswordResetConfirmForm.jsx';
import Navbar from '#client/components/Navbar/Navbar.jsx';
import Link from '#client/components/Link/Link.jsx';

import AuthActions from '#client/actions/Auth.js';

const ResetPasswordConfirmPage = ({ dispatch, history, isMobileApp, location }) => {
  useTransitionHook();
  useBranch({
    isMobileApp: ['mobileApp', 'isMobileApp'],
  });
  useScreenId(SCREEN_ID_RESET_PASSWORD_CONFIRM);
  useScrollToTop();

  const redirectUser = async (user) => {
    const userLandingPage = getUserLandingPage({
      userRoles: user.roles,
      isMobileApp: isMobileApp,
    });
    history.push(userLandingPage);
  };

  const onPasswordResetConfirmFormSubmit = (formValues) => {
    const { token } = parseQueryString(location.search);

    dispatch(AuthActions.resetPasswordRequested, {
      token: token,
      password: formValues.password,
    })
      .then(({ user }) => redirectUser(user));
  };

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
            onSubmit={onPasswordResetConfirmFormSubmit}
            locationQuery={parseQueryString(location.search)}
          />
        </div>
      </div>
    </div>
  );
};

ResetPasswordConfirmPage.getPageMetadata = (state) => ({
  pageTitle: state.get(['env', 'APP_TITLE']),
  keywords: `${state.get(['env', 'APP_ID'])}, reset password`,
  description: 'Reset your password.',
});

ResetPasswordConfirmPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  isMobileApp: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
};

export default ResetPasswordConfirmPage;
