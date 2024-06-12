import React from 'react';
import { Navigate } from 'react-router-dom';

import { hasRoleAnonymous } from '#common/userRoles.js';

import useBranch from '#client/hooks/useBranch.js';
import { SCREEN_ID_SIGNUP } from '#client/constants/screenIds.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useDispatch from '#client/hooks/useDispatch.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import SignupForm from '#client/components/SignupForm/SignupForm.jsx';
import { getUserLandingPage } from '#client/helpers/allowedRoles.jsx';

const SignUpPage = () => {
  useTransitionHook();
  useScreenId(SCREEN_ID_SIGNUP);
  const dispatch = useDispatch();
  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  if (!hasRoleAnonymous(currentUser.roles)) {
    return (
      <Navigate to={getUserLandingPage({ userRoles: currentUser.roles })} />
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
