import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import assert from 'assert';

import parseQueryString from '#common/util/parseQueryString.js';
import typeCheck from '#common/util/typeCheck.js';
import {
  hasRoleAdmin,
} from '#common/userRoles.js';

import useBranch from '#client/core/branch.jsx';
import log from '#client/lib/log.js';
import configureDecoratedComponent from '#client/helpers/configureDecoratedComponent.js';

const debug = log.debug('hooks:useAllowedRoles');

export function getUserLandingPage({ userRoles }) {
  const afterSignupLink = '/';

  if (hasRoleAdmin(userRoles)) {
    return '/admin';
  }
  return afterSignupLink;
}

export default function useAllowedRoles(params) {
  typeCheck('params::NonEmptyObject', params);

  const {
    roles,
    redirectUrl,
    redirectToUserLandingPage,
    addRedirectQueryParam,
  } = params;

  typeCheck('roles::NonEmptyArray', roles);

  assert(
    !!redirectUrl ^ !!redirectToUserLandingPage,
    'Either redirectUrl or redirectToUserLandingPage must be set, but not both.'
  );

  assert(
    !addRedirectQueryParam || !redirectToUserLandingPage,
    'Can not use addRedirectQueryParam and redirectToUserLandingPage simultaneously.'
  );

  return function allowedRolesDecorator(ComponentToDecorate) {
    const DecoratedComponent = (props) => {
      const { currentUserRoles } = useBranch({
        currentUserRoles: ['currentUser', 'roles'],
      });

      const navigate = useNavigate();
      const location = useLocation();
      const locationQuery = parseQueryString(location.search);
      const isAllowed = roles.some((allowedRole) => currentUserRoles.includes(allowedRole));

      const redirectTo = (
        locationQuery.next
        || redirectUrl
        || getUserLandingPage({ userRoles: currentUserRoles })
      );

      if (!isAllowed) {
        debug(
          `Current user roles "${currentUserRoles.join(', ')}" not allowed in ` +
          `component to decorate, redirecting to ${redirectTo}`
        );
      }

      return isAllowed
        ? <ComponentToDecorate {...props} />
        : (
          <Navigate
            to={
              `${redirectTo}${addRedirectQueryParam
                ? '?next=' + encodeURIComponent(location.pathname)
                : ''
              }`
            }
          />
        );
    };

    DecoratedComponent.propTypes = {
      currentUserRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
      location: PropTypes.object.isRequired,
    };

    configureDecoratedComponent({
      DecoratedComponent: DecoratedComponent,
      OriginalComponent: ComponentToDecorate,
    });

    return DecoratedComponent;
  };
}
