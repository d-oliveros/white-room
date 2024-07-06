import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import parseQueryString from '#white-room/util/parseQueryString.js';

import useBranch from '#white-room/client/hooks/useBranch.js';

import PasswordResetConfirmForm from '#base/view/components/PasswordResetConfirmForm/PasswordResetConfirmForm.jsx';
import Navbar from '#base/view/components/Navbar/Navbar.jsx';
import Link from '#base/view/components/Link/Link.jsx';

import AuthActions from '#auth/view/actions/index.jsx';

const ResetPasswordConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isMobileApp } = useBranch({
    isMobileApp: ['mobileApp', 'isMobileApp'],
  });

  const onPasswordResetConfirmFormSubmit = (formValues) => {
    const { token } = parseQueryString(location.search);

    AuthActions.resetPasswordRequested({
      token: token,
      password: formValues.password,
    })
      .then(({ user }) => navigate('/'));
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

ResetPasswordConfirmPage.getMetadata = ({ state }) => ({
  title: state.get(['env', 'APP_TITLE']),
  keywords: `${state.get(['env', 'APP_ID'])}, reset password`,
  description: 'Reset your password.',
});

export default ResetPasswordConfirmPage;
