import React from 'react';

import { SCREEN_ID_NOT_FOUND } from '#client/constants/screenIds';
import useTransitionHook from '#client/helpers/useTransitionHook.js';
import useScreenId from '#client/helpers/useScreenId.js';
import useScrollToTop from '#client/helpers/useScrollToTop.js';

const NotFound = () => {
  useTransitionHook();
  useScreenId(SCREEN_ID_NOT_FOUND);
  useScrollToTop();

  return (
    <div>
      <h1>Whoops, that page doesn't exist</h1>
    </div>
  );
};

export default NotFound;
