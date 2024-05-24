import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';
import queryString from 'query-string';
import assert from 'assert';

import typeCheck from 'common/util/typeCheck';
import {
  hasRoleAdmin,
} from 'common/userRoles';

import branch from 'client/core/branch';
import log from 'client/lib/log';
import configureDecoratedComponent from 'client/helpers/configureDecoratedComponent';

const debug = log.debug('decorators:allowedRoles');

export function getUserLandingPage({ userRoles }) {
  const afterSignupLink = '/';

  if (hasRoleAdmin(userRoles)) {
    return '/admin';
  }
  return afterSignupLink;
}

export default function allowedRoles(params) {
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
    @branch({
      currentUserRoles: ['currentUser', 'roles'],
    })
    @withRouter
    class DecoratedComponent extends Component {
      static propTypes = {
        currentUserRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
        location: PropTypes.object.isRequired,
      }

      render() {
        const { currentUserRoles, location } = this.props;
        const locationQuery = queryString.parse(location.search);
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
          ? <ComponentToDecorate {...this.props} />
          : (
            <Redirect
              to={
                `${redirectTo}${addRedirectQueryParam
                  ? '?next=' + encodeURIComponent(location.pathname)
                  : ''
                }`
              }
            />
          );
      }
    }

    configureDecoratedComponent({
      DecoratedComponent: DecoratedComponent,
      OriginalComponent: ComponentToDecorate,
    });

    return DecoratedComponent;
  };
}
