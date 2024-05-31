import * as cookiesConfig from '#config/cookies.js';
import typeCheck from '#common/util/typeCheck.js';

import {
  API_ACTION_LOGOUT,
} from '#api/actionTypes';

import updateDeviceRegistrationIdsApiAction from '#api/handlers/User/updateDeviceRegistrationIds.js';

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
      cookiesConfig.session.name,
      null,
      cookiesConfig.session.settings
    );
  },
};
