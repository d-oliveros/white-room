import React from 'react';
import { Redirect } from 'react-router-dom';

import { hasRoleAnonymous } from '#common/userRoles.js';

import useBranch from '#client/core/useBranch.js';
import { SCREEN_ID_SIGNUP } from '#client/constants/screenIds';
import useScreenId from '#client/helpers/useScreenId.js';
import useTransitionHook from '#client/helpers/useTransitionHook.js';
import SignupForm from '#client/components/SignupForm/SignupForm.jsx';
import { getUserLandingPage } from '#client/helpers/allowedRoles';

const SignUpPage = ({ currentUser, dispatch }) => {
  useTransitionHook();
  useScreenId(SCREEN_ID_SIGNUP);
  useBranch({
    currentUser: ['currentUser'],
  });

  if (!hasRoleAnonymous(currentUser.roles)) {
    return (
      <Redirect to={getUserLandingPage({ userRoles: currentUser.roles })} />
    );
  }

  return (
    <SignupForm
      dispatch={dispatch}
    />
  );
};

SignUpPage.getPageMetadata = () => ({
  pageTitle: 'Sign Up',
});

export default SignUpPage;
