import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes.js';
import {
  USER_ROLE_ANONYMOUS,
} from '#common/userRoles.js';
import { SCREEN_ID_LOGIN } from '#client/constants/screenIds.js';

import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';
import useApiState from '#client/hooks/useApiState.jsx';
import useBranch from '#client/hooks/useBranch.js';
import { getUserLandingPage } from '#client/helpers/allowedRoles.jsx';

import Box from '#client/components/Box/Box.jsx';
import Link from '#client/components/Link/Link.jsx';
import LoginForm from '#client/components/LoginForm/LoginForm.jsx';
import Logo from '#client/components/Logo/Logo.jsx';

import AuthActions from '#client/actions/Auth/index.js';

const LoginPage = () => {
  useTransitionHook();
  useScreenId(SCREEN_ID_LOGIN);
  useScrollToTop();

  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  const loginApiState = useApiState({
    action: API_ACTION_LOGIN,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFormSubmit = async (formValues) => {
    setIsSubmitting(true);

    await loginApiState.dispatch(AuthActions.login, {
      phone: formValues.phone,
      password: formValues.password,
    });

    setIsSubmitting(false);
  };

  if (!isSubmitting && !currentUser.roles.includes(USER_ROLE_ANONYMOUS)) {
    const userLandingPage = getUserLandingPage({
      userRoles: currentUser.roles,
    });
    return <Navigate to={userLandingPage} />;
  }

  return (
    <Box>
      <Logo redirectTo='/' />
      <div className='loginFormContainer'>
        <h1>Log In</h1>
        <LoginForm
          submitError={loginApiState.error}
          isSubmitting={loginApiState.inProgress || isSubmitting}
          onSubmit={onFormSubmit}
        />
        <Link to='/signup'>create new account</Link>
        <Link to='/reset-password'>Forgot Password?</Link>
      </div>
    </Box>
  );
};

LoginPage.getPageMetadata = () => ({
  pageTitle: 'Login',
});

export default LoginPage;
