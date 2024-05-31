import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import {
  API_ACTION_LOGIN,
} from '#api/actionTypes.js';
import {
  USER_ROLE_ANONYMOUS,
} from '#common/userRoles.js';
import { SCREEN_ID_LOGIN } from '#client/constants/screenIds';

import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';
import withApiState from '#client/helpers/withApiState.js';
import branch from '#client/core/branch.js';
import { getUserLandingPage } from '#client/helpers/allowedRoles';

import Box from '#client/components/Box/Box.js';
import Link from '#client/components/Link/Link.js';
import LoginForm from '#client/components/LoginForm/LoginForm.js';
import Logo from '#client/components/Logo/Logo.js';

import AuthActions from '#client/actions/Auth.js';

@withTransitionHook
@withApiState({
  loginApiState: {
    action: API_ACTION_LOGIN,
  },
})
@withScreenId(SCREEN_ID_LOGIN)
@withScrollToTop
@branch({
  currentUser: ['currentUser'],
})
class LoginPage extends Component {
  static getPageMetadata = () => ({
    pageTitle: 'Login',
  });

  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    loginApiState: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  async onFormSubmit(formValues) {
    const { dispatch } = this.props;

    this.setState({
      isSubmitting: true,
    });

    await dispatch(AuthActions.login, {
      phone: formValues.phone,
      password: formValues.password,
    });

    this.setState({
      isSubmitting: false,
    });
  }

  render() {
    const {
      currentUser,
      loginApiState,
    } = this.props;

    const {
      isSubmitting,
    } = this.state;

    if (!isSubmitting && !currentUser.roles.includes(USER_ROLE_ANONYMOUS)) {
      const userLandingPage = getUserLandingPage({
        userRoles: currentUser.roles,
      });
      return (
        <Redirect to={userLandingPage} />
      );
    }

    return (
      <Box>
        <Logo redirectTo='/' />
        <div className='loginFormContainer'>
          <h1>Log In</h1>
          <LoginForm
            submitError={loginApiState.error}
            isSubmitting={loginApiState.inProgress || isSubmitting}
            onSubmit={this.onFormSubmit}
          />
          <Link to='/signup'>
            create new account
          </Link>
          <Link to='/reset-password'>
            Forgot Password?
          </Link>
        </div>
      </Box>
    );
  }
}

export default LoginPage;
