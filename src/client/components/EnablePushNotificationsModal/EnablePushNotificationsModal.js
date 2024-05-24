import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Portal } from 'react-portal';

import sendDataToMobileApp, {
  MOBILE_APP_ACTION_TYPE_REQUEST_PUSH_NOTIFICATION_PERMISSION,
} from 'client/helpers/sendDataToMobileApp';

import Box from 'client/components/Box/Box';
import ButtonDeprecated, {
  BUTTON_THEME_WHITE,
  BUTTON_THEME_BLUE,
} from 'client/components/ButtonDeprecated/ButtonDeprecated';

import branch from 'client/core/branch';

@branch({
  currentUser: ['currentUser'],
})
class EnablePushNotificationsModal extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    dispatch: PropTypes.func.isRequired,
  }

  _onEnablePushNoficationsClick = () => {
    const { onClose, dispatch } = this.props;
    sendDataToMobileApp({
      actionType: MOBILE_APP_ACTION_TYPE_REQUEST_PUSH_NOTIFICATION_PERMISSION,
    });
    setTimeout(() => {
      dispatch(({ state }) => {
        state.set(['mobileApp', 'askPushNotifications'], false);
      });
      if (onClose) {
        onClose();
      }
    }, 500);
  }

  render() {
    const { onClose } = this.props;

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
              <ButtonDeprecated theme={BUTTON_THEME_WHITE} onClick={onClose}>
                not now
              </ButtonDeprecated>
              <Box width='15px' />
              <ButtonDeprecated theme={BUTTON_THEME_BLUE} onClick={this._onEnablePushNoficationsClick}>
                ok
              </ButtonDeprecated>
            </Box>
          </div>
        </div>
      </Portal>
    );
  }
}

export default EnablePushNotificationsModal;
