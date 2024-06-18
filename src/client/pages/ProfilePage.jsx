import React from 'react';

import useTransitionHook from '#client/hooks/useTransitionHook.js';

const ProfilePage = () => {
  useTransitionHook();

  return (
    <div>
      <h1>This is a Profile Page.</h1>
    </div>
  );
};

export default ProfilePage;
