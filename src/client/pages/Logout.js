import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import {
  hasRoleAnonymous,
} from 'common/userRoles';

import {
  SCREEN_ID_LOGOUT,
} from 'client/constants/screenIds';

import Logo from 'client/components/Logo/Logo';

import log from 'client/lib/log';
import AuthActions from 'client/actions/Auth';
import branch from 'client/core/branch';
import withTransitionHook from 'client/helpers/withTransitionHook';
import withScreenId from 'client/helpers/withScreenId';
import withScrollToTop from 'client/helpers/withScrollToTop';

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
    const locationQuery = queryString.parse(location.search);
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
