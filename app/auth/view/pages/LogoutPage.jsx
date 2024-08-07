import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import parseQueryString from '#white-room/util/parseQueryString.js';
import { hasRoleAnonymous } from '#user/constants/roles.js';

import Logo from '#app/view/components/Logo/Logo.jsx';

import logger from '#white-room/logger.js';
import AuthActions from '#auth/view/actions/index.jsx';
import useBranch from '#white-room/client/hooks/useBranch.js';
import useDispatch from '#white-room/client/hooks/useDispatch.js';

const LogoutPage = () => {
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
        .catch((error) => logger.error(error));
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

LogoutPage.getMetadata = () => ({
  title: 'Logout',
});

export default LogoutPage;
