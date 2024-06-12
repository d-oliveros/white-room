import React from 'react';

import { SCREEN_ID_PROFILE } from '#client/constants/screenIds.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';

const ProfilePage = () => {
  useTransitionHook();
  useScreenId(SCREEN_ID_PROFILE);
  useScrollToTop();

  return (
    <div>
      <h1>Whoops, that page doesn&apos;t exist</h1>
    </div>
  );
};

export default ProfilePage;
