import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { hasRoleAnonymous } from '#common/userRoles.js';

import branch from '#client/core/branch.js';
import { SCREEN_ID_SIGNUP } from '#client/constants/screenIds';
import withScreenId from '#client/helpers/withScreenId.js';
import withTransitionHook from '#client/helpers/withTransitionHook.js';
import SignupForm from '#client/components/SignupForm/SignupForm.js';
import { getUserLandingPage } from '#client/helpers/allowedRoles';

@withTransitionHook
@withScreenId(SCREEN_ID_SIGNUP)
@branch({
  currentUser: ['currentUser'],
})
class SignUpPage extends Component {
  static getPageMetadata = () => ({
    pageTitle: 'Sign Up',
  });

  render() {
    const { currentUser, dispatch } = this.props;
    if (!hasRoleAnonymous(currentUser.roles)) {
      return (
        <Redirect to={getUserLandingPage({ userRoles: currentUser.roles })} />
      );
    }

    return (
      <SignupForm
        dispatch={dispatch}
      />
    );
  }
}

export default SignUpPage;
