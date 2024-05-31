import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  API_ACTION_VERIFY_ACCOUNT_EXIST,
} from '#api/actionTypes.js';
import { SCREEN_ID_RESET_PASSWORD } from '#client/constants/screenIds';
import { USER_ROLE_ANONYMOUS } from '#common/userRoles.js';

import log from '#client/lib/log.js';
import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';
import allowedRoles from '#client/helpers/allowedRoles.js';
import withApiState from '#client/helpers/withApiState.js';
import postWithState from '#client/actions/postWithState.js';

import AuthActions from '#client/actions/Auth.js';

import PasswordResetSmsForm from '#client/components/PasswordResetSmsForm/PasswordResetSmsForm.js';
import SmsSendingIndicator from '#client/components/SmsSendingIndicator/SmsSendingIndicator.js';
import Navbar from '#client/components/Navbar/Navbar.js';
import Link from '#client/components/Link/Link.js';
import ErrorMessage from '#client/components/ErrorMessage/ErrorMessage.js';

@withTransitionHook
@allowedRoles({
  roles: [
    USER_ROLE_ANONYMOUS,
  ],
  redirectUrl: '/',
})
@withApiState({
  verifyPhoneApiState: {
    action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  },
})
@withScreenId(SCREEN_ID_RESET_PASSWORD)
@withScrollToTop
class ResetPasswordPage extends Component {
  static getPageMetadata = () => ({
    keywords: 'reset password',
    description: 'Reset your password.',
  })

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    verifyPhoneApiState: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showSmsSending: false,
      phoneNumberDoesNotExist: false,
      phone: '',
    };
    this._unmounting = false;
    this._onRequestVerificationCode = this._onRequestVerificationCode.bind(this);
  }

  componentWillUnmount() {
    this._unmounting = true;
  }

  async _onRequestVerificationCode({ phone }) {
    const {
      dispatch,
      history,
      location,
    } = this.props;

    this.setState({
      showSmsSending: false,
      phoneNumberDoesNotExist: false,
      phone,
    });

    try {
      const userExist = await dispatch(postWithState, {
        action: API_ACTION_VERIFY_ACCOUNT_EXIST,
        payload: {
          phone: phone,
        },
      });

      if (userExist) {
        await dispatch(AuthActions.resetPasswordSmsCodeRequested, {
          phone: phone,
        });

        this.setState({
          showSmsSending: true,
        });

        setTimeout(() => {
          if (!this._unmounting) {
            this.setState({
              showSmsSending: false,
            });
          }
          history.push(`/reset-password-verify-code${location.search}`);
        }, 3000);
      }
      else {
        this.setState({
          showSmsSending: false,
          phoneNumberDoesNotExist: true,
        });
      }
    }
    catch (error) {
      log.error(error);
    }
  }

  render() {
    const {
      verifyPhoneApiState,
    } = this.props;
    const {
      showSmsSending,
      phoneNumberDoesNotExist,
      phone,
    } = this.state;

    return (
      <div className='page-reset-password'>
        <Navbar
          redirectLogoTo='/'
          leftButton={
            <Link
              className='link back'
              redirectToLastLocation
              restoreScrollPosition
              to='/login'
            >
              Back
            </Link>
          }
        />
        <div className='resetContainer'>
          <div className='resetFormContainer'>
            {phoneNumberDoesNotExist && (
              <ErrorMessage>
                Sorry, there is no account with that phone number
              </ErrorMessage>
            )}
            {!verifyPhoneApiState.inProgress
              && !showSmsSending
              && (
                <PasswordResetSmsForm
                  onSubmit={this._onRequestVerificationCode}
                />
              )
            }
            {showSmsSending && (
              <SmsSendingIndicator
                phone={phone}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPasswordPage;
