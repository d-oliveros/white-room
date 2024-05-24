import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
} from 'api/actionTypes';
import { USER_ROLE_ANONYMOUS } from 'common/userRoles';
import { SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE } from 'client/constants/screenIds';

import log from 'client/lib/log';
import branch from 'client/core/branch';
import withTransitionHook from 'client/helpers/withTransitionHook';
import withScreenId from 'client/helpers/withScreenId';
import withScrollToTop from 'client/helpers/withScrollToTop';
import allowedRoles from 'client/helpers/allowedRoles';
import withApiState from 'client/helpers/withApiState';
import AuthActions from 'client/actions/Auth';

import PasswordResetSmsVerifyCode from 'client/components/PasswordResetSmsVerifyCode/PasswordResetSmsVerifyCode';
import SmsSendingIndicator from 'client/components/SmsSendingIndicator/SmsSendingIndicator';
import Navbar from 'client/components/Navbar/Navbar';
import Link from 'client/components/Link/Link';

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
@branch({
  phone: ['resetPasswordForm', 'phone'],
})
@withScreenId(SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE)
@withScrollToTop
class ResetPasswordVerifyCodePage extends Component {
  static getPageMetadata = (state) => ({
    pageTitle: state.get(['env', 'APP_TITLE']),
    section: SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE,
    keywords: `${state.get(['env', 'APP_ID'])}, reset password, code`,
    description: 'Reset your password.',
  })

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    phone: PropTypes.string.isRequired,
    verifyPhoneApiState: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showSmsSending: false,
      incorrectCodeSubmitted: false,
    };
    this._unmounting = false;
    this._onRequestVerificationCode = this._onRequestVerificationCode.bind(this);
  }

  async _validateVerificationCode(phone, code) {
    const {
      dispatch,
      history,
      location,
    } = this.props;
    try {
      const isValidCode = await dispatch(AuthActions.verifyPhoneSmsCodeSubmit, {
        phone,
        code: code.toString(),
      });

      if (isValidCode) {
        const token = await dispatch(AuthActions.resetPasswordGenerateToken, {
          phone,
        });
        let url = '/reset-password-confirm?';
        url += queryString.stringify({
          ...queryString.parse(location.search || ''),
          token,
        });
        history.push(url);
      }
      else {
        this.setState({ incorrectCodeSubmitted: true });
      }
    }
    catch (error) {
      log.error(error);
    }
  }

  _onRequestVerificationCode(phone) {
    const {
      dispatch,
    } = this.props;

    this.setState({
      showSmsSending: true,
    });

    setTimeout(() => {
      if (!this._unmounting) {
        this.setState({
          showSmsSending: false,
        });
      }
    }, 3000);

    dispatch(AuthActions.resetPasswordSmsCodeRequested, {
      phone,
    });
  }

  render() {
    const {
      verifyPhoneApiState,
      phone,
    } = this.props;
    const {
      showSmsSending,
      incorrectCodeSubmitted,
    } = this.state;

    return (
      <div className='page-reset-password'>
        <Navbar
          redirectLogoTo='/'
          leftButton={(
            <Link
              className='link back'
              redirectToLastLocation
              restoreScrollPosition
              to='/reset-password'
            >
              Back
            </Link>
          )}
        />
        <div className='resetContainer'>
          <div className='resetFormContainer'>
            {incorrectCodeSubmitted && (
              <div className='formMessage error'>
                <span>
                  Uh oh, that's not the right code!
                </span>
              </div>
            )}
            {!verifyPhoneApiState.inProgress
              && !showSmsSending
              && (
                <PasswordResetSmsVerifyCode
                  onSubmit={({ code }) => this._validateVerificationCode(phone, code)}
                />
              )
            }
            {showSmsSending && (
              <SmsSendingIndicator
                phone={phone}
              />
            )}
            {!showSmsSending && (
              <div className='action-link-container'>
                <a onClick={() => this._onRequestVerificationCode(phone)}>
                  Didn't get the code? Click to send another.
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPasswordVerifyCodePage;
