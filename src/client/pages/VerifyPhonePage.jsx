import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { formatPhoneNumber } from '#common/formatters';

import {
  USER_ROLE_USER,
} from '#common/userRoles.js';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
} from '#api/actionTypes.js';

import {
  SCREEN_ID_VERIFY_PHONE,
} from '#client/constants/screenIds.js';

import AuthActions from '#client/actions/Auth.js';
import NavigatorActions from '#client/actions/Navigator.js';

import useTransitionHook from '#client/helpers/useTransitionHook.js';
import useScreenId from '#client/helpers/useScreenId.js';
import useScrollToTop from '#client/helpers/useScrollToTop.js';
import useAllowedRoles from '#client/helpers/useAllowedRoles.js';
import useApiState from '#client/helpers/useApiState.js';

import ButtonDeprecated from '#client/components/ButtonDeprecated/ButtonDeprecated.jsx';
import InputText from '#client/components/InputText/InputText.jsx';
import Navbar from '#client/components/Navbar/Navbar.jsx';
import BackButton from '#client/components/BackButton/BackButton.jsx';
import SmsSendingIndicator from '#client/components/SmsSendingIndicator/SmsSendingIndicator.jsx';

import useBranch from '#client/core/useBranch.js';

const VerifyPhonePage = ({ currentUser, verifyPhoneCodeRequestedApiState, verifyPhoneCodeSubmitApiState, requestShowingApiState, dispatch }) => {
  useTransitionHook();
  useScrollToTop();
  useAllowedRoles({
    roles: [
      USER_ROLE_USER,
    ],
    redirectUrl: '/login',
    addRedirectQueryParam: true,
  });
  useApiState({
    verifyPhoneCodeRequestedApiState: {
      action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
    },
    verifyPhoneCodeSubmitApiState: {
      action: API_ACTION_VERIFY_PHONE_SMS_CODE_SUBMIT,
    },
  });
  useBranch({
    currentUser: ['currentUser'],
  });
  useScreenId(SCREEN_ID_VERIFY_PHONE);

  const [state, setState] = useState({
    phoneInput: currentUser.phone || '',
    codeInput: '',
    codeRequested: false,
    incorrectCodeSubmitted: false,
    showSmsSending: false,
  });
  const { phoneInput, codeInput, codeRequested, incorrectCodeSubmitted, showSmsSending } = state;

  let _unmounting = false;

  useEffect(() => {
    if (currentUser.phoneVerified) {
      _onPhoneVerified();
    }

    return () => {
      _unmounting = true;
    };
  }, []);

  const _requestVerificationCode = async (phone) => {
    setState((prevState) => ({
      ...prevState,
      showSmsSending: true,
      incorrectCodeSubmitted: false,
    }));

    setTimeout(() => {
      if (!_unmounting) {
        setState((prevState) => ({
          ...prevState,
          showSmsSending: false,
          codeRequested: true,
        }));
      }
    }, 3000);

    await dispatch(AuthActions.verifyPhoneSmsCodeRequested, {
      phone: phone,
    });
  };

  const _resendVerificationCode = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setState((prevState) => ({
      ...prevState,
      incorrectCodeSubmitted: false,
    }));

    _requestVerificationCode(phoneInput);
  };

  const _verifyCode = async (phoneInput, codeInput) => {
    const isVerified = await dispatch(AuthActions.verifyPhoneSmsCodeSubmit, {
      phone: phoneInput,
      code: codeInput,
    });

    setState((prevState) => ({
      ...prevState,
      incorrectCodeSubmitted: !isVerified,
    }));

    if (isVerified) {
      _onPhoneVerified();
    }
  };

  const _onHandleSubmitRequest = (event) => {
    event.preventDefault();
    _requestVerificationCode(phoneInput);
  };

  const _onHandleSubmitVerify = (event) => {
    event.preventDefault();
    _verifyCode(phoneInput, codeInput);
  };

  const _onPhoneInputChange = (event) => {
    const phoneInputValue = event.target.value.trim() || '';
    if (phoneInputValue.length <= 10 && !isNaN(Number(phoneInputValue))) {
      setState((prevState) => ({
        ...prevState,
        phoneInput: phoneInputValue,
      }));
    }
  };

  const _onCodeInputChange = (event) => {
    const codeInputValue = event.target.value.trim() || '';
    if (codeInputValue.length <= 4 && !isNaN(Number(codeInputValue))) {
      setState((prevState) => ({
        ...prevState,
        codeInput: codeInputValue,
      }));
    }
  };

  const _onBack = (event) => {
    event.preventDefault();

    if (!codeRequested) {
      dispatch(NavigatorActions.goBack, { defaultTo: '/feed' });
      return;
    }

    setState((prevState) => ({
      ...prevState,
      codeRequested: false,
    }));
  };

  const _onPhoneVerified = async () => {
    await dispatch(NavigatorActions.replace, { to: '/' });
  };

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
              onClick={_onBack}
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
                  onChange={_onCodeInputChange}
                  type='tel'
                  pattern='[0-9]*'
                  inputMode='numeric'
                  value={codeInput}
                />
                <ButtonDeprecated
                  type='submit'
                  onClick={_onHandleSubmitVerify}
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
                  onClick={_resendVerificationCode}
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
                  onChange={_onPhoneInputChange}
                  type='tel'
                  pattern='[0-9]*'
                  inputMode='numeric'
                  value={phoneInput}
                />
                <ButtonDeprecated
                  type='submit'
                  onClick={_onHandleSubmitRequest}
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
};

VerifyPhonePage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  verifyPhoneCodeRequestedApiState: PropTypes.object.isRequired,
  verifyPhoneCodeSubmitApiState: PropTypes.object.isRequired,
  requestShowingApiState: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default VerifyPhonePage;
