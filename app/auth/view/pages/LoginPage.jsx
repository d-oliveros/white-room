import { Navigate } from 'react-router-dom';

import {
  hasRoleAnonymous,
} from '#user/constants/roles.js';

import getUserLandingPage from '#user/view/helpers/getUserLandingPage.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import PageModal from '#ui/view/layout/PageModal/PageModal.jsx';

import LoginFormConnected from '#auth/view/forms/LoginForm/LoginFormConnected.jsx';

const LoginPage = () => {
  const currentUser = useBranch('currentUser');
  console.log('LOGIN PAGE');
  console.log(currentUser.roles);

  if (!hasRoleAnonymous(currentUser.roles)) {
    return (
      <Navigate
        to={getUserLandingPage(currentUser)}
      />
    );
  }

  return (
    <PageModal
      title="Login"
      backgroundUrl="https://wallpaperswide.com/download/natures_mirror-wallpaper-1920x1200.jpg"
      footerLinkUrl="/signup"
      footerLinkLabel="Create Account"
    >
      <LoginFormConnected />
    </PageModal>
  );
};

LoginPage.getMetadata = () => ({
  title: 'Login - Whiteroom',
  keywords: 'whiteroom, keyword',
  description: 'whiteroom login page.',
  image: 'https://whiteroom.com/images/metadata/og-house.jpg',
});

export default LoginPage;
