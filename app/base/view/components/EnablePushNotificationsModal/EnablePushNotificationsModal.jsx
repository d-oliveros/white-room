import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Portal } from 'react-portal';

import useDispatch from '#white-room/client/hooks/useDispatch.js';
import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_REQUEST_PUSH_NOTIFICATION_PERMISSION,
} from '#white-room/client/helpers/sendDataToMobileApp.js';

import Box from '#base/view/components/Box/Box.jsx';
import Button, {
  BUTTON_THEME_ADOBE_WHITE,
  BUTTON_THEME_ADOBE_BLUE,
} from '#base/view/components/Button/Button.jsx';

import useBranch from '#white-room/client/hooks/useBranch.js';

const EnablePushNotificationsModal = ({ onClose }) => {
  const dispatch = useDispatch();

  const _onEnablePushNotificationsClick = () => {
    sendDataToMobileApp({
      actionType: MOBILE_APP_ACTION_TYPE_REQUEST_PUSH_NOTIFICATION_PERMISSION,
    });
    setTimeout(() => {
      dispatch(({ state }) => {
        state.set(['client', 'mobileApp', 'askPushNotifications'], false);
      });
      if (onClose) {
        onClose();
      }
    }, 500);
  };

  return (
    <Portal>
      <div className={classnames('modal success confirm push webview')}>
        <div className='contentContainer'>
          <div className='heroIcon' />
          <div className='textContainer'>
            <span className='category'>
              Enable notifications
            </span>
            <span className='headline'>
              Get notified when important things happen!
            </span>
          </div>

          <Box className='actionsContainer' margin='0 auto'>
            <Button theme={BUTTON_THEME_ADOBE_WHITE} onClick={onClose}>
              not now
            </Button>
            <Box width='15px' />
            <Button theme={BUTTON_THEME_ADOBE_BLUE} onClick={_onEnablePushNotificationsClick}>
              ok
            </Button>
          </Box>
        </div>
      </div>
    </Portal>
  );
};

EnablePushNotificationsModal.propTypes = {
  onClose: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
};

export default EnablePushNotificationsModal;
