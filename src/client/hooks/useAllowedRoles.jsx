import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import assert from 'assert';

import parseQueryString from '#white-room/util/parseQueryString.js';
import typeCheck from '#white-room/util/typeCheck.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import logger from '#white-room/logger.js';

const debug = logger.createDebug('hooks:useAllowedRoles');

export default function useAllowedRoles({ roles, redirectUrl, addRedirectQueryParam = true }) {
  typeCheck('roles::NonEmptyArray', roles);

  assert(
    !!redirectUrl,
    'redirectUrl must be set.'
  );

  const { currentUser } = useBranch({
    currentUser: ['currentUser'],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const locationQuery = parseQueryString(location.search);
  const isAllowed = roles.some((allowedRole) => currentUser.roles.includes(allowedRole));

  const redirectTo = (
    locationQuery.next
    || redirectUrl
    || '/'
  );

  useEffect(() => {
    if (!isAllowed) {
      debug(
        `Current user roles "${currentUser.roles.join(', ')}" not allowed, redirecting to ${redirectTo}`
      );

      const redirectToWithQuery = addRedirectQueryParam
        ? `${redirectTo}?next=${encodeURIComponent(location.pathname)}`
        : redirectTo;

      navigate(redirectToWithQuery);
    }
  }, [
    isAllowed,
    navigate,
    redirectTo,
    addRedirectQueryParam,
    location.pathname,
    currentUser.roles,
    locationQuery.next,
  ]);

  return isAllowed;
}
