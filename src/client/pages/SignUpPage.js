import React, { Component } from 'react';
import { Redirect } from 'react-router-dom/cjs/react-router-dom';

import { hasRoleAnonymous } from 'common/userRoles';

import branch from 'client/core/branch';
import { SCREEN_ID_SIGNUP } from 'client/constants/screenIds';
import withScreenId from 'client/helpers/withScreenId';
import withTransitionHook from 'client/helpers/withTransitionHook';
import SignupForm from 'client/components/SignupForm/SignupForm';
import { getUserLandingPage } from 'client/helpers/allowedRoles';

@withTransitionHook
@withScreenId(SCREEN_ID_SIGNUP)
@branch({
  currentUser: ['currentUser'],
})
class SignUpPage extends Component {
  static pageTitle = 'Sign Up'

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
