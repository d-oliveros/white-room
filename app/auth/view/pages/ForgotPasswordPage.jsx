import { Navigate } from 'react-router-dom';

import {
  hasRoleAnonymous,
} from '#user/constants/roles.js';

import getUserLandingPage from '#user/view/helpers/getUserLandingPage.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import PageModal from '#ui/view/layout/PageModal/PageModal.jsx';

import ForgotPasswordFormConnected from '#auth/view/forms/ForgotPasswordForm/ForgotPasswordFormConnected.jsx';

const ForgotPasswordPage = () => {
  const currentUser = useBranch('currentUser');

  if (!hasRoleAnonymous(currentUser.roles)) {
    return (
      <Navigate
        to={getUserLandingPage(currentUser)}
      />
    );
  }

  return (
    <PageModal
      title="Forgot Password"
      backgroundUrl="https://wallpaperswide.com/download/natures_mirror-wallpaper-1920x1200.jpg"
      footerLinkUrl="/login"
      footerLinkLabel="Back"
    >
      <ForgotPasswordFormConnected />
    </PageModal>
  );
};

ForgotPasswordPage.getMetadata = () => ({
  title: 'Forgot Password - Whiteroom',
  keywords: 'whiteroom, keyword',
  description: 'Forgot your whiteroom password?',
  image: 'https://whiteroom.com/images/metadata/og-house.jpg',
});

export default ForgotPasswordPage;
