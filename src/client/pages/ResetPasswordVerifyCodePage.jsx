import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
} from '#api/actionTypes.js';
import { USER_ROLE_ANONYMOUS } from '#common/userRoles.js';
import { SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE } from '#client/constants/screenIds.js';

import log from '#client/lib/log.js';
import useBranch from '#client/hooks/useBranch.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';
import useAllowedRoles from '#client/hooks/useAllowedRoles.jsx';
import useApiState from '#client/hooks/useApiState.jsx';
import AuthActions from '#client/actions/Auth/index.js';

import PasswordResetSmsVerifyCode from '#client/components/PasswordResetSmsVerifyCode/PasswordResetSmsVerifyCode.jsx';
import SmsSendingIndicator from '#client/components/SmsSendingIndicator/SmsSendingIndicator.jsx';
import Navbar from '#client/components/Navbar/Navbar.jsx';
import Link from '#client/components/Link/Link.jsx';

const ResetPasswordVerifyCodePage = () => {
  const navigate = useNavigate();
  useTransitionHook();
  useAllowedRoles({
    roles: [
      USER_ROLE_ANONYMOUS,
    ],
    redirectUrl: '/',
  });
  const { verifyPhoneApiState } = useApiState({
    verifyPhoneApiState: {
      action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
    },
  });
  const { phone } = useBranch({
    phone: ['resetPasswordForm', 'phone'],
  });
  useScreenId(SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE);
  useScrollToTop();

  const [state, setState] = useState({
    showSmsSending: false,
    incorrectCodeSubmitted: false,
  });
  const { showSmsSending, incorrectCodeSubmitted } = state;

  const _validateVerificationCode = async (phone, code) => {
    try {
      const isValidCode = await AuthActions.verifyPhoneSmsCodeSubmit({
        phone,
        code: code.toString(),
      });

      if (isValidCode) {
        const token = await AuthActions.resetPasswordGenerateToken({
          phone,
        });
        const url = `/reset-password-confirm?token=${encodeURIComponent(token)}`;
        navigate(url);
      } else {
        setState((prevState) => ({ ...prevState, incorrectCodeSubmitted: true }));
      }
    } catch (error) {
      log.error(error);
    }
  };

  const _onRequestVerificationCode = (phone) => {
    setState((prevState) => ({ ...prevState, showSmsSending: true }));

    setTimeout(() => {
      setState((prevState) => ({ ...prevState, showSmsSending: false }));
    }, 3000);

    AuthActions.resetPasswordSmsCodeRequested({
      phone,
    });
  };

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
                onSubmit={({ code }) => _validateVerificationCode(phone, code)}
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
              <a onClick={() => _onRequestVerificationCode(phone)}>
                Didn't get the code? Click to send another.
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ResetPasswordVerifyCodePage.getPageMetadata = (state) => ({
  pageTitle: state.get(['env', 'APP_TITLE']),
  section: SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE,
  keywords: `${state.get(['env', 'APP_ID'])}, reset password, code`,
  description: 'Reset your password.',
});

export default ResetPasswordVerifyCodePage;
