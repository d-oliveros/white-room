import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useBlocker } from 'react-router-dom';

// import NavigatorActions from '#white-room/client/actions/Navigator.js';
import {
  BUTTON_THEME_ADOBE_GREEN,
  BUTTON_THEME_ADOBE_RED,
} from '#base/view/components/Button/Button.jsx';
import SimpleMessageModal, {
  SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP,
} from '#base/view/components/SimpleMessageModal/SimpleMessageModal.jsx';

const RouteLeavingGuard = ({
  when,
  dispatch,
  headline = 'You will lose your work if you navigate away, are you sure you want to leave?',
}) => {
  const [shoudShowConfirmModal, setShoudShowConfirmModal] = useState(false);
  const [blockedPath, setBlockedPath] = useState(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (confirmedNavigation && blockedPath) {
      // Navigate to the previous blocked location
      // TODO: IMPLEMENT
      // dispatch(NavigatorActions.replace, {
      //   to: blockedPath,
      // });
      navigate(blockedPath, { replace: true });
    }
  }, [confirmedNavigation, blockedPath, dispatch, navigate]);

  const _shouldBlockNavigation = useCallback(({ pathname }) => {
    if (!confirmedNavigation) {
      // Block navigation and show the confirmation modal
      setShoudShowConfirmModal(true);
      setBlockedPath(pathname);
      return false;
    }

    // Do not block navigation
    return true;
  }, [confirmedNavigation]);

  const _onClickCancelNavigation = useCallback(() => {
    setShoudShowConfirmModal(false);
  }, []);

  const _onClickConfirmNavigation = useCallback(() => {
    setShoudShowConfirmModal(false);
    setConfirmedNavigation(true);
  }, []);

  useBlocker(
    (tx) => {
      if (when) {
        _shouldBlockNavigation(tx.location);
      } else {
        tx.retry();
      }
    },
    when
  );

  return (
    <>
      {shoudShowConfirmModal && (
        <SimpleMessageModal
          iconUrl='/images/caution-red.svg'
          headline={headline}
          multiButtons={[
            {
              buttonText: 'Leave',
              buttonTheme: BUTTON_THEME_ADOBE_RED,
              onButtonClick: _onClickConfirmNavigation,
            },
            {
              buttonText: 'Stay',
              buttonTheme: BUTTON_THEME_ADOBE_GREEN,
              onButtonClick: _onClickCancelNavigation,
            },
          ]}
          maxWidth='375'
          theme={SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP}
        />
      )}
    </>
  );
};

RouteLeavingGuard.propTypes = {
  when: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  headline: PropTypes.string,
};

export default RouteLeavingGuard;
