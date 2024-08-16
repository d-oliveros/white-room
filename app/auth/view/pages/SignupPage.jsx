import useAllowedRoles from '#whiteroom/client/hooks/useAllowedRoles.js';

import {
  ROLE_ANONYMOUS,
} from '#user/constants/roles.js';

import getUserLandingPage from '#user/view/helpers/getUserLandingPage.js';
import useBranch from '#whiteroom/client/hooks/useBranch.js';
import PageModal from '#ui/view/layout/PageModal/PageModal.jsx';

import SignupFormConnected from '#auth/view/forms/SignupForm/SignupFormConnected.jsx';

const SignupPage = () => {
  const currentUser = useBranch('currentUser');

  useAllowedRoles({
    roles: [ROLE_ANONYMOUS],
    redirectUrl: getUserLandingPage(currentUser),
  });

  return (
    <PageModal
      title="Signup"
      backgroundUrl="https://wallpaperswide.com/download/natures_mirror-wallpaper-1920x1200.jpg"
      footerLinkUrl="/login"
      footerLinkLabel="Already have an account?"
    >
      <SignupFormConnected />
    </PageModal>
  );
};

SignupPage.getMetadata = () => ({
  title: 'Signup - Whiteroom',
  keywords: 'whiteroom, keyword',
  description: 'whiteroom login page.',
  image: 'https://whiteroom.com/images/metadata/og-house.jpg',
});

export default SignupPage;
