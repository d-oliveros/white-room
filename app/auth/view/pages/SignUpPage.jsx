import { Navigate } from 'react-router-dom';

import { hasRoleAnonymous } from '#user/constants/roles.js';

import useBranch from '#white-room/client/hooks/useBranch.js';
import useDispatch from '#white-room/client/hooks/useDispatch.js';
import SignupForm from '#ui/view/components/SignupForm/SignupForm.jsx';

import getUserLandingPage from '#auth/view/helpers/getUserLandingPage.js';

const SignUpPage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  if (!hasRoleAnonymous(currentUser.roles)) {
    return (
      <Navigate to={getUserLandingPage(currentUser)} />
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
