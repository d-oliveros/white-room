import { Component } from 'react';
import PropTypes from 'prop-types';

import log from 'client/lib/log';

import MobileAppActions from 'client/actions/MobileApp';
import branch from 'client/core/branch';

export const WEB_APP_ACTION_TYPE_UPDATE_DEVICE_REGISTRATION_IDS = 'WEB_APP_ACTION_TYPE_UPDATE_DEVICE_REGISTRATION_IDS'; // eslint-disable-line max-len
export const WEB_APP_ACTION_TYPE_INITIAL_MOBILE_CONFIG = 'WEB_APP_ACTION_TYPE_INITIAL_MOBILE_CONFIG';
export const WEB_APP_ACTION_TYPE_CURRENT_LOCATION = 'WEB_APP_ACTION_TYPE_CURRENT_LOCATION';
export const WEB_APP_ACTION_TYPE_ID_VERIFICATION_RESULT = 'WEB_APP_ACTION_TYPE_ID_VERIFICATION_RESULT';

@branch()
class MobileAppEventListener extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    global.document.addEventListener('mobileAppEvent', this.mobileAppEventHandler);
  }

  componentWillUnmount() {
    global.document.removeEventListener('mobileAppEvent', this.mobileAppEventHandler);
  }

  mobileAppEventHandler = (evt) => {
    const { dispatch } = this.props;

    try {
      const { actionType, data } = evt.detail;
      switch (actionType) {
        case WEB_APP_ACTION_TYPE_UPDATE_DEVICE_REGISTRATION_IDS: {
          dispatch(MobileAppActions.updateDeviceRegistrationIds, data);
          break;
        }
        case WEB_APP_ACTION_TYPE_INITIAL_MOBILE_CONFIG: {
          const { mobileAppState, updateDeviceRegistrationIds } = data;
          dispatch(MobileAppActions.setMobileAppState, mobileAppState);

          if (updateDeviceRegistrationIds) {
            dispatch(MobileAppActions.updateDeviceRegistrationIds, updateDeviceRegistrationIds);
          }
          else if (mobileAppState.deviceRegistrationId) {
            dispatch(MobileAppActions.updateDeviceRegistrationIds, {
              newDeviceRegistrationId: mobileAppState.deviceRegistrationId,
            });
          }
          break;
        }
      }
    }
    catch (error) {
      log.error(error);
    }
  }

  render() {
    return null;
  }
}

export default MobileAppEventListener;
