import useAllowedRoles from '#whiteroom/client/hooks/useAllowedRoles.js';
import useBranch from '#whiteroom/client/hooks/useBranch.js';

import {
  ROLE_ANONYMOUS,
} from '#user/constants/roles.js';

import PageModal from '#ui/view/layout/PageModal/PageModal.jsx';
import LoginFormConnected from '#auth/view/forms/LoginForm/LoginFormConnected.jsx';
import getUserLandingPage from '#user/view/helpers/getUserLandingPage.js';

const LoginPage = () => {
  const currentUser = useBranch('currentUser');

  useAllowedRoles({
    roles: [ROLE_ANONYMOUS],
    redirectUrl: getUserLandingPage(currentUser),
  });

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
