import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import parseQueryString from '#common/util/parseQueryString.js';
import { SCREEN_ID_RESET_PASSWORD_CONFIRM } from '#client/constants/screenIds.js';

import { getUserLandingPage } from '#client/helpers/allowedRoles.jsx';

import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';
import useBranch from '#client/hooks/useBranch.js';

import PasswordResetConfirmForm from '#client/components/PasswordResetConfirmForm/PasswordResetConfirmForm.jsx';
import Navbar from '#client/components/Navbar/Navbar.jsx';
import Link from '#client/components/Link/Link.jsx';

import AuthActions from '#client/actions/Auth/index.js';

const ResetPasswordConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useTransitionHook();
  const { isMobileApp } = useBranch({
    isMobileApp: ['mobileApp', 'isMobileApp'],
  });
  useScreenId(SCREEN_ID_RESET_PASSWORD_CONFIRM);
  useScrollToTop();

  const redirectUser = async (user) => {
    const userLandingPage = getUserLandingPage({
      userRoles: user.roles,
      isMobileApp: isMobileApp,
    });
    navigate(userLandingPage);
  };

  const onPasswordResetConfirmFormSubmit = (formValues) => {
    const { token } = parseQueryString(location.search);

    AuthActions.resetPasswordRequested({
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

export default ResetPasswordConfirmPage;
