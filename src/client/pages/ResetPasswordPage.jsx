import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  API_ACTION_VERIFY_PHONE_SMS_CODE_REQUESTED,
  API_ACTION_VERIFY_ACCOUNT_EXIST,
} from '#api/actionTypes.js';
import { SCREEN_ID_RESET_PASSWORD } from '#client/constants/screenIds.js';
import { USER_ROLE_ANONYMOUS } from '#common/userRoles.js';

import log from '#client/lib/log.js';
import useTransitionHook from '#client/hooks/useTransitionHook.js';
import useScreenId from '#client/hooks/useScreenId.jsx';
import useScrollToTop from '#client/hooks/useScrollToTop.jsx';
import useAllowedRoles from '#client/hooks/useAllowedRoles.jsx';
import useApiState from '#client/hooks/useApiState.jsx';
import postWithState from '#client/actions/postWithState.js';

import AuthActions from '#client/actions/Auth/index.jsx';

import PasswordResetSmsForm from '#client/components/PasswordResetSmsForm/PasswordResetSmsForm.jsx';
import SmsSendingIndicator from '#client/components/SmsSendingIndicator/SmsSendingIndicator.jsx';
import Navbar from '#client/components/Navbar/Navbar.jsx';
import Link from '#client/components/Link/Link.jsx';
import ErrorMessage from '#client/components/ErrorMessage/ErrorMessage.jsx';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  useScreenId(SCREEN_ID_RESET_PASSWORD);
  useScrollToTop();

  const [state, setState] = useState({
    showSmsSending: false,
    phoneNumberDoesNotExist: false,
    phone: '',
  });
  const { showSmsSending, phoneNumberDoesNotExist, phone } = state;

  const _onRequestVerificationCode = async ({ phone }) => {
    setState({
      showSmsSending: false,
      phoneNumberDoesNotExist: false,
      phone,
    });

    try {
      const userExist = await postWithState({
        action: API_ACTION_VERIFY_ACCOUNT_EXIST,
        payload: {
          phone: phone,
        },
      });

      if (userExist) {
        await AuthActions.resetPasswordSmsCodeRequested({
          phone: phone,
        });

        setState((prevState) => ({
          ...prevState,
          showSmsSending: true,
        }));

        setTimeout(() => {
          setState((prevState) => ({
            ...prevState,
            showSmsSending: false,
          }));
          navigate(`/reset-password-verify-code${location.search}`);
        }, 3000);
      } else {
        setState((prevState) => ({
          ...prevState,
          showSmsSending: false,
          phoneNumberDoesNotExist: true,
        }));
      }
    } catch (error) {
      log.error(error);
    }
  };

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
                onSubmit={_onRequestVerificationCode}
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
};

ResetPasswordPage.getPageMetadata = () => ({
  keywords: 'reset password',
  description: 'Reset your password.',
});

export default ResetPasswordPage;
