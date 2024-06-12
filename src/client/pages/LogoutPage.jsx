import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import parseQueryString from '#common/util/parseQueryString.js';
import { hasRoleAnonymous } from '#common/userRoles.js';

import { SCREEN_ID_LOGOUT } from '#client/constants/screenIds.js';

import Logo from '#client/components/Logo/Logo.jsx';

import log from '#client/lib/log.js';
import AuthActions from '#client/actions/Auth/index.js';
import useBranch from '#client/hooks/useBranch.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';
import useDispatch from '#client/hooks/useDispatch.js';

const LogoutPage = () => {
  useTransitionHook();
  useScreenId(SCREEN_ID_LOGOUT);
  useScrollToTop();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUserRoles } = useBranch({
    currentUserRoles: ['currentUser', 'roles'],
  });

  useEffect(() => {
    const locationQuery = parseQueryString(global.location?.search);
    const redirectUrl = locationQuery.next || '/login';

    if (!hasRoleAnonymous(currentUserRoles)) {
      dispatch(AuthActions.logout)
        .then(() => {
          if (global.location?.href) {
            global.location.href = redirectUrl;
          }
        })
        .catch((error) => log.error(error));
    }
    else {
      navigate(redirectUrl);
    }
  }, [currentUserRoles, dispatch, navigate]);

  return (
    <div className='page-logout'>
      <div className='loginContainer'>
        <Logo />
        <div className='loading-gif' />
      </div>
    </div>
  );
};

LogoutPage.getPageMetadata = () => ({
  pageTitle: 'Logout',
});

export default LogoutPage;
