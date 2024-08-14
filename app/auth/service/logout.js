import * as cookiesConfig from '#white-room/config/cookies.js';
import typeCheck from '#white-room/util/typeCheck.js';

import updateDeviceRegistrationIdsService from '#user/service/updateDeviceRegistrationIds.js';

export default {
  validate({ deviceRegistrationId }) {
    typeCheck('deviceRegistrationId::Maybe String', deviceRegistrationId);
  },
  async handler({ session, payload: { deviceRegistrationId }, setCookie }) {
    if (session?.userId && deviceRegistrationId) {
      await updateDeviceRegistrationIdsService.handler({
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
