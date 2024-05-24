import typeCheck from 'common/util/typeCheck';

import {
  API_ACTION_LOGOUT,
} from 'api/actionTypes';

import updateDeviceRegistrationIdsApiAction from 'api/handlers/User/updateDeviceRegistrationIds';

export default {
  type: API_ACTION_LOGOUT,
  validate({ deviceRegistrationId }) {
    typeCheck('deviceRegistrationId::Maybe String', deviceRegistrationId);
  },
  async handler({ session, payload: { deviceRegistrationId }, setCookie }) {
    if (session && session.userId && deviceRegistrationId) {
      await updateDeviceRegistrationIdsApiAction.handler({
        session: session,
        payload: { oldDeviceRegistrationId: deviceRegistrationId },
      });
    }
    setCookie(
      __config.cookies.session.name,
      null,
      __config.cookies.session.settings
    );
  },
};
