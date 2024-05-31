import React, { Component } from 'react';
import PropTypes from 'prop-types';

import parseQueryString from '#common/util/parseQueryString.js';
import {
  hasRoleAnonymous,
} from '#common/userRoles.js';

import {
  SCREEN_ID_LOGOUT,
} from '#client/constants/screenIds.js';

import Logo from '#client/components/Logo/Logo.jsx';

import log from '#client/lib/log.js';
import AuthActions from '#client/actions/Auth.js';
import branch from '#client/core/branch.js';
import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';

@withTransitionHook
@withScreenId(SCREEN_ID_LOGOUT)
@withScrollToTop
@branch({
  currentUserRoles: ['currentUser', 'roles'],
})
class LogoutPage extends Component {
  static getPageMetadata = () => ({
    pageTitle: 'Logout',
  });

  static propTypes = {
    currentUserRoles: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const {
      currentUserRoles,
      dispatch,
      history,
    } = this.props;
    const locationQuery = parseQueryString(location.search);
    const redirectUrl = locationQuery.next || '/login';

    if (!hasRoleAnonymous(currentUserRoles)) {
      dispatch(AuthActions.logout)
        .then(() => {
          global.location.href = redirectUrl;
        })
        .catch((error) => log.error(error));
    }
    else {
      history.push(redirectUrl);
    }
  }

  render() {
    return (
      <div className='page-logout'>
        <div className='loginContainer'>
          <Logo />
          <div className='loading-gif' />
        </div>
      </div>
    );
  }
}

export default LogoutPage;
