import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes.js';
import {
  USER_ROLE_ANONYMOUS,
} from '#common/userRoles.js';

import getUserLandingPage from '#client/helpers/getUserLandingPage.js';
import useApiState from '#client/hooks/useApiState.jsx';
import useBranch from '#client/hooks/useBranch.js';
import useDispatch from '#client/hooks/useDispatch.js';

import Box from '#client/components/Box/Box.jsx';
import Link from '#client/components/Link/Link.jsx';
import LoginForm from '#client/components/LoginForm/LoginForm.jsx';
import Logo from '#client/components/Logo/Logo.jsx';

import AuthActions from '#client/actions/Auth/index.jsx';

const LoginPage = () => {
  const dispatch = useDispatch();
  const currentUser = useBranch('currentUser');

  if (!currentUser.roles.includes(USER_ROLE_ANONYMOUS)) {
    return (
      <Navigate
        to={getUserLandingPage({ userRoles: currentUser.roles })}
      />
    );
  }

  return (
    <Box>
      <Logo redirectTo='/' />
      <div className='loginFormContainer'>
        <h1>Log In</h1>
        <LoginForm />
        <Link to='/signup'>create new account</Link>
        <Link to='/reset-password'>Forgot Password?</Link>
      </div>
    </Box>
  );
};

LoginPage.getMetadata = ({ props, params }) => ({
  title: 'Login - Whiteroom',
  keywords: 'whiteroom, keyword',
  description: 'whiteroom login page.',
  image: 'https://whiteroom.com/images/metadata/og-house.jpg',
});


LoginPage.fetchPageData = () => {
  return null;
};

export default LoginPage;
