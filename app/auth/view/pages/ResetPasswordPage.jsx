import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROLE_ANONYMOUS } from '#user/constants/roles.js';

import logger from '#white-room/logger.js';
import useAllowedRoles from '#white-room/client/hooks/useAllowedRoles.jsx';
import useApiState from '#white-room/client/hooks/useApiState.jsx';
import postWithState from '#white-room/client/actions/postWithState.js';

import AuthActions from '#auth/view/actions/index.jsx';

import PasswordResetSmsForm from '#app/view/components/PasswordResetSmsForm/PasswordResetSmsForm.jsx';
import SmsSendingIndicator from '#app/view/components/SmsSendingIndicator/SmsSendingIndicator.jsx';
import Navbar from '#app/view/components/Navbar/Navbar.jsx';
import Link from '#app/view/components/Link/Link.jsx';
import ErrorMessage from '#app/view/components/ErrorMessage/ErrorMessage.jsx';

const ResetPasswordPage = () => {
  useAllowedRoles({
    roles: [
      ROLE_ANONYMOUS,
    ],
    redirectUrl: '/',
  });

  const navigate = useNavigate();
  const location = useLocation();

  const { verifyPhoneApiState } = useApiState({
    verifyPhoneApiState: { path: '/auth/verifyPhoneSmsCodeRequested' },
  });

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
        path: '/auth/verifyAccountExists',
        payload: {
          phone: phone,
        },
      });

      if (userExist) {
        await AuthActions.resetPasswordSmsCodeRequested({
          phone,
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
      logger.error(error);
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

ResetPasswordPage.getMetadata = () => ({
  keywords: 'reset password',
  description: 'Reset your password.',
});

export default ResetPasswordPage;
