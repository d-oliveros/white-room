import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router-dom';

import NavigatorActions from '#client/actions/Navigator.js';
import {
  BUTTON_THEME_GREEN_ADOBE,
  BUTTON_THEME_RED_ADOBE,
} from '#client/components/ButtonDeprecated/ButtonDeprecated.jsx';
import SimpleMessageModal, {
  SIMPLE_MESSAGE_MODAL_THEME_SLIDE_UP,
} from '#client/components/SimpleMessageModal/SimpleMessageModal.jsx';

const RouteLeavingGuard = ({
  when,
  dispatch,
  headline = 'You will lose your work if you navigate away, are you sure you want to leave?',
}) => {
  const [shoudShowConfirmModal, setShoudShowConfirmModal] = useState(false);
  const [blockedPath, setBlockedPath] = useState(null);
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);

  useEffect(() => {
    if (confirmedNavigation && blockedPath) {
      // Navigate to the previous blocked location
      dispatch(NavigatorActions.replace, {
        to: blockedPath,
      });
    }
  }, [confirmedNavigation, blockedPath, dispatch]);

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

  return (
    <>
      <Prompt
        when={when}
        message={_shouldBlockNavigation}
      />
      {shoudShowConfirmModal && (
        <SimpleMessageModal
          iconUrl='/images/caution-red.svg'
          headline={headline}
          multiButtons={[
            {
              buttonText: 'Leave',
              buttonTheme: BUTTON_THEME_RED_ADOBE,
              onButtonClick: _onClickConfirmNavigation,
            },
            {
              buttonText: 'Stay',
              buttonTheme: BUTTON_THEME_GREEN_ADOBE,
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
