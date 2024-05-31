import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { formatPhoneNumber } from '#common/formatters';

import {
  USER_ROLE_USER,
} from '#common/userRoles.js';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
} from '#api/actionTypes';

import {
  SCREEN_ID_VERIFY_PHONE,
} from '#client/constants/screenIds.js';

import AuthActions from '#client/actions/Auth.js';
import NavigatorActions from '#client/actions/Navigator.js';

import withTransitionHook from '#client/helpers/withTransitionHook.js';
import withScreenId from '#client/helpers/withScreenId.js';
import withScrollToTop from '#client/helpers/withScrollToTop.js';
import withApiState from '#client/helpers/withApiState.js';
import allowedRoles from '#client/helpers/allowedRoles.js';

import ButtonDeprecated from '#client/components/ButtonDeprecated/ButtonDeprecated.js';
import InputText from '#client/components/InputText/InputText.js';
import Navbar from '#client/components/Navbar/Navbar.js';
import BackButton from '#client/components/BackButton/BackButton.js';
import SmsSendingIndicator from '#client/components/SmsSendingIndicator/SmsSendingIndicator.js';

import branch from '#client/core/branch.js';

@withTransitionHook
@withScrollToTop
@allowedRoles({
  roles: [
    USER_ROLE_USER,
  ],
  redirectUrl: '/login',
  addRedirectQueryParam: true,
})
@withApiState({
  verifyPhoneCodeRequestedApiState: {
    action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  },
  verifyPhoneCodeSubmitApiState: {
    action: API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
  },
})
@branch({
  currentUser: ['currentUser'],
})
@withScreenId(SCREEN_ID_VERIFY_PHONE)
class VerifyPhonePage extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    verifyPhoneCodeRequestedApiState: PropTypes.object.isRequired,
    verifyPhoneCodeSubmitApiState: PropTypes.object.isRequired,
    requestShowingApiState: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      phoneInput: props.currentUser.phone || '',
      codeInput: '',
      codeRequested: false,
      incorrectCodeSubmitted: false,
      showSmsSending: false,
    };
  }

  componentDidMount() {
    const { currentUser } = this.props;
    if (currentUser.phoneVerified) {
      this._onPhoneVerified();
    }
  }

  async _requestVerificationCode(phone) {
    const {
      dispatch,
    } = this.props;

    this.setState({
      showSmsSending: true,
      incorrectCodeSubmitted: false,
    });
    setTimeout(() => {
      if (!this._unmounting) {
        this.setState({
          showSmsSending: false,
          codeRequested: true,
        });
      }
    }, 3000);

    await dispatch(AuthActions.verifyPhoneSmsCodeRequested, {
      phone: phone,
    });
  }

  _resendVerificationCode = (event) => {
    const {
      phoneInput,
    } = this.state;

    event.preventDefault();
    event.stopPropagation();

    this.setState({
      incorrectCodeSubmitted: false,
    });

    this._requestVerificationCode(phoneInput);
  }

  async _verifyCode(phoneInput, codeInput) {
    const {
      dispatch,
    } = this.props;

    const isVerified = await dispatch(AuthActions.verifyPhoneSmsCodeSubmit, {
      phone: phoneInput,
      code: codeInput,
    });

    this.setState({
      incorrectCodeSubmitted: !isVerified,
    });

    if (isVerified) {
      this._onPhoneVerified();
    }
  }

  _onHandleSubmitRequest = (event) => {
    const {
      phoneInput,
    } = this.state;

    event.preventDefault();
    this._requestVerificationCode(phoneInput);
  }

  _onHandleSubmitVerify = (event) => {
    const {
      phoneInput,
      codeInput,
    } = this.state;

    event.preventDefault();
    this._verifyCode(phoneInput, codeInput);
  }

  _onPhoneInputChange = (event) => {
    const phoneInputValue = event.target.value.trim() || '';
    if (phoneInputValue.length <= 10 && !isNaN(Number(phoneInputValue))) {
      this.setState({
        phoneInput: phoneInputValue,
      });
    }
  }

  _onCodeInputChange = (event) => {
    const codeInputValue = event.target.value.trim() || '';
    if (codeInputValue.length <= 4 && !isNaN(Number(codeInputValue))) {
      this.setState({
        codeInput: codeInputValue,
      });
    }
  }

  _onBack = (event) => {
    const { dispatch } = this.props;
    const { codeRequested } = this.state;

    event.preventDefault();

    if (!codeRequested) {
      dispatch(NavigatorActions.goBack, { defaultTo: '/feed' });
      return;
    }

    this.setState({
      codeRequested: false,
    });
  }

  async _onPhoneVerified() {
    const {
      dispatch,
    } = this.props;

    dispatch(NavigatorActions.replace, { to: '/' });
  }

  render() {
    const {
      verifyPhoneCodeRequestedApiState,
      verifyPhoneCodeSubmitApiState,
      requestShowingApiState,
    } = this.props;

    const {
      phoneInput,
      codeInput,
      showSmsSending,
      incorrectCodeSubmitted,
      codeRequested,
    } = this.state;

    const isBusy = (
      requestShowingApiState.inProgress
      || verifyPhoneCodeRequestedApiState.inProgress
      || verifyPhoneCodeSubmitApiState.inProgress
    );

    return (
      <div>
        {showSmsSending && (
          <SmsSendingIndicator
            phone={phoneInput}
          />
        )}
        <div className='moveInDate'>
          <Navbar
            leftButton={(
              <BackButton
                onClick={this._onBack}
              />
            )}
          />
          {codeRequested
            ? (
              <div className='stepContainer'>
                <div className='textContainer'>
                  <h1>Enter your 4-digit code</h1>
                  <span className='explainerText'>
                    We just texted the code to {formatPhoneNumber(phoneInput)}.
                  </span>
                </div>
                <div className='formContainer answers'>
                  <InputText
                    placeholder='1234'
                    onChange={this._onCodeInputChange}
                    type='tel'
                    pattern='[0-9]*'
                    inputmode='numeric'
                    value={codeInput}
                  />
                  <ButtonDeprecated
                    type='submit'
                    onClick={this._onHandleSubmitVerify}
                    disabled={isBusy || codeInput.length !== 4}
                  >
                    {isBusy ? 'loading...' : 'verify'}
                  </ButtonDeprecated>
                </div>
                <div className='resendCodeContainer'>
                  <div
                    className={
                      classnames(
                        incorrectCodeSubmitted && 'formMessage error',
                      )
                    }
                    onClick={this._resendVerificationCode}
                  >
                    {incorrectCodeSubmitted
                      ? (
                        <span>
                          That's not the right code! Click to send another.
                        </span>
                      ) : (
                        <span className='resend'>
                          Didn't get the code? Click to send another.
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='stepContainer'>
                <div className='textContainer'>
                  <h1>Verify your phone number</h1>
                  <span className='explainerText'>We'll text you a code to verify this number.</span>
                </div>
                <div className='formContainer answers'>
                  <InputText
                    placeholder='Enter your phone number'
                    onChange={this._onPhoneInputChange}
                    type='tel'
                    pattern='[0-9]*'
                    inputmode='numeric'
                    value={phoneInput}
                  />
                  <ButtonDeprecated
                    type='submit'
                    onClick={this._onHandleSubmitRequest}
                    disabled={isBusy || phoneInput.length !== 10}
                  >
                    {isBusy ? 'loading...' : 'send text'}
                  </ButtonDeprecated>
                </div>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default VerifyPhonePage;
