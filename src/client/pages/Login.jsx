import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes.js';
import {
  USER_ROLE_ANONYMOUS,
} from '#common/userRoles.js';
import { SCREEN_ID_LOGIN } from '#client/constants/screenIds';

import useTransitionHook from '#client/helpers/useTransitionHook.js';
import useScreenId from '#client/helpers/useScreenId.js';
import useScrollToTop from '#client/helpers/useScrollToTop.js';
import useApiState from '#client/helpers/useApiState.js';
import useBranch from '#client/core/useBranch';
import { getUserLandingPage } from '#client/helpers/allowedRoles';

import Box from '#client/components/Box/Box.jsx';
import Link from '#client/components/Link/Link.jsx';
import LoginForm from '#client/components/LoginForm/LoginForm.jsx';
import Logo from '#client/components/Logo/Logo.jsx';

import AuthActions from '#client/actions/Auth.js';

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
    return <Redirect to={userLandingPage} />;
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

LoginPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  loginApiState: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default LoginPage;
