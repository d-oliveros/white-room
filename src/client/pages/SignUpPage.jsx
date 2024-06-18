import React from 'react';
import { Navigate } from 'react-router-dom';

import { hasRoleAnonymous } from '#common/userRoles.js';

import useBranch from '#client/hooks/useBranch.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useDispatch from '#client/hooks/useDispatch.js';
import SignupForm from '#client/components/SignupForm/SignupForm.jsx';
import { getUserLandingPage } from '#client/helpers/allowedRoles.jsx';

const SignUpPage = () => {
  useTransitionHook(SignUpPage);
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

SignUpPage.getMetadata = () => ({
  pageTitle: 'Sign Up',
});

export default SignUpPage;
