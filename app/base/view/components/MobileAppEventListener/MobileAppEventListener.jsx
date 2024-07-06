import { useEffect } from 'react';
import PropTypes from 'prop-types';

import log from '#white-room/client/lib/log.js';

// import MobileAppActions from '#white-room/client/actions/MobileApp/index.jsx';
import useDispatch from '#white-room/client/hooks/useDispatch.js';

export const WEB_APP_ACTION_TYPE_UPDATE_DEVICE_REGISTRATION_IDS = 'WEB_APP_ACTION_TYPE_UPDATE_DEVICE_REGISTRATION_IDS'; // eslint-disable-line max-len
export const WEB_APP_ACTION_TYPE_INITIAL_MOBILE_CONFIG = 'WEB_APP_ACTION_TYPE_INITIAL_MOBILE_CONFIG';
export const WEB_APP_ACTION_TYPE_CURRENT_LOCATION = 'WEB_APP_ACTION_TYPE_CURRENT_LOCATION';

const MobileAppEventListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const mobileAppEventHandler = (evt) => {
      try {
        const { actionType, data } = evt.detail;
        switch (actionType) {
          case WEB_APP_ACTION_TYPE_UPDATE_DEVICE_REGISTRATION_IDS: {
            console.log('TODO?');
            // dispatch(MobileAppActions.updateDeviceRegistrationIds, data);
            break;
          }
          case WEB_APP_ACTION_TYPE_INITIAL_MOBILE_CONFIG: {
            const { mobileAppState, updateDeviceRegistrationIds } = data;
            // dispatch(MobileAppActions.setMobileAppState, mobileAppState);

            if (updateDeviceRegistrationIds) {
              // dispatch(MobileAppActions.updateDeviceRegistrationIds, updateDeviceRegistrationIds);
            }
            else if (mobileAppState.deviceRegistrationId) {
              // dispatch(MobileAppActions.updateDeviceRegistrationIds, {
              //   newDeviceRegistrationId: mobileAppState.deviceRegistrationId,
              // });
            }
            break;
          }
        }
      }
      catch (error) {
        log.error(error);
      }
    };

    global.document.addEventListener('mobileAppEvent', mobileAppEventHandler);

    return () => {
      global.document.removeEventListener('mobileAppEvent', mobileAppEventHandler);
    };
  }, [dispatch]);

  return null;
};

export default MobileAppEventListener;
