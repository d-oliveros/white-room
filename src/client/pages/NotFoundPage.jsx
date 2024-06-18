import React from 'react';

import useTransitionHook from '#client/hooks/useTransitionHook.js';

const NotFoundPage = () => {
  useTransitionHook(NotFoundPage);

  return (
    <div onClick={()=>console.log('CLICK')}>
      <h1>Whoops, that page doesn&apos;t exist</h1>
    </div>
  );
};

export default NotFoundPage;
