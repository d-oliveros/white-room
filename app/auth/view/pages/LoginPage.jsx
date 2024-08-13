import { Navigate, Link } from 'react-router-dom';

import {
  hasRoleAnonymous,
} from '#user/constants/roles.js';

import getUserLandingPage from '#auth/view/helpers/getUserLandingPage.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import LoginForm from '#ui/view/components/LoginForm/LoginForm.jsx';
// import Logo from '#ui/view/components/Logo/Logo.jsx';

const LoginPage = () => {
  const currentUser = useBranch('currentUser');

  if (!hasRoleAnonymous(currentUser.roles)) {
    return (
      <Navigate
        to={getUserLandingPage(currentUser)}
      />
    );
  }

  return (
    <div>
      <div className='loginFormContainer'>
        <h1>Log In</h1>
        <LoginForm />
        <Link to='/signup'>create new account</Link>
        <Link to='/reset-password'>Forgot Password?</Link>
      </div>
    </div>
  );
};

LoginPage.getMetadata = () => ({
  title: 'Login - Whiteroom',
  keywords: 'whiteroom, keyword',
  description: 'whiteroom login page.',
  image: 'https://whiteroom.com/images/metadata/og-house.jpg',
});


export default LoginPage;
