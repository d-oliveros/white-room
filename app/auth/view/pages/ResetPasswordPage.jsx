import { Navigate } from 'react-router-dom';

import {
  hasRoleAnonymous,
} from '#user/constants/roles.js';

import getUserLandingPage from '#user/view/helpers/getUserLandingPage.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import PageModal from '#ui/view/layout/PageModal/PageModal.jsx';

import ResetPasswordFormConnected from '#auth/view/forms/ResetPasswordForm/ResetPasswordFormConnected.jsx';

const ResetPasswordPage = () => {
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
      title="Reset Password"
      backgroundUrl="https://wallpaperswide.com/download/natures_mirror-wallpaper-1920x1200.jpg"
    >
      <ResetPasswordFormConnected />
    </PageModal>
  );
};

ResetPasswordPage.getMetadata = () => ({
  title: 'Reset Password - Whiteroom',
  keywords: 'whiteroom, keyword',
  description: 'Reset your whiteroom password.',
  image: 'https://whiteroom.com/images/metadata/og-house.jpg',
});

export default ResetPasswordPage;
