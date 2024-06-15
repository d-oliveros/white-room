import React from 'react';

// import { SCREEN_ID_NOT_FOUND } from '#client/constants/screenIds.js';
// import useTransitionHook from '#client/hooks/useTransitionHook.js';
// import useScreenId from '#client/hooks/useScreenId.jsx';
// import useScrollToTop from '#client/hooks/useScrollToTop.jsx';

const NotFoundPage = () => {
  // useTransitionHook();
  // useScreenId(SCREEN_ID_NOT_FOUND);
  // useScrollToTop();
  console.log('HERE');

  return (
    <div onClick={()=>console.log('CLICK')}>
      <h1>Whoops, that page doesn&apos;t exist</h1>
    </div>
  );
};

export default NotFoundPage;
