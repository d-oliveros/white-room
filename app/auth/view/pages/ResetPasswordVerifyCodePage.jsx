import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROLE_ANONYMOUS } from '#user/constants/roles.js';

import log from '#white-room/client/lib/log.js';
import useBranch from '#white-room/client/hooks/useBranch.js';
import useAllowedRoles from '#white-room/client/hooks/useAllowedRoles.jsx';
import useApiState from '#white-room/client/hooks/useApiState.jsx';
import AuthActions from '#auth/view/actions/index.jsx';

import PasswordResetSmsVerifyCode from '#base/view/components/PasswordResetSmsVerifyCode/PasswordResetSmsVerifyCode.jsx';
import SmsSendingIndicator from '#base/view/components/SmsSendingIndicator/SmsSendingIndicator.jsx';
import Navbar from '#base/view/components/Navbar/Navbar.jsx';
import Link from '#base/view/components/Link/Link.jsx';

const ResetPasswordVerifyCodePage = () => {
  useAllowedRoles({
    roles: [
      ROLE_ANONYMOUS,
    ],
    redirectUrl: '/',
  });
  const navigate = useNavigate();

  const { verifyPhoneApiState } = useApiState({
    verifyPhoneApiState: {
      action: API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
    },
  });

  const { phone } = useBranch({
    phone: ['resetPasswordForm', 'phone'],
  });

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

ResetPasswordVerifyCodePage.getMetadata = (state) => ({
  pageTitle: state.get(['client', 'env', 'APP_TITLE']),
  section: SCREEN_ID_RESET_PASSWORD_VALIDATE_CODE,
  keywords: `${state.get(['client', 'env', 'APP_ID'])}, reset password, code`,
  description: 'Reset your password.',
});

export default ResetPasswordVerifyCodePage;
