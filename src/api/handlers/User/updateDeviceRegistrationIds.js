import typeCheck from '#common/util/typeCheck.js';

import { API_ACTION_USER_UPDATE_DEVICE_REGISTRATION_IDS } from '#api/actionTypes';
import { ALL_USER_ROLES } from '#common/userRoles.js';

import User from '#server/models/User/index.js';

export default {
  type: API_ACTION_USER_UPDATE_DEVICE_REGISTRATION_IDS,
  roles: ALL_USER_ROLES,
  validate({ newDeviceRegistrationId, oldDeviceRegistrationId }) {
    typeCheck('newDeviceRegistrationId::NonEmptyString', newDeviceRegistrationId);
    typeCheck('oldDeviceRegistrationId::Maybe String', oldDeviceRegistrationId);
  },
  async handler({
    session: { userId },
    payload: { newDeviceRegistrationId, oldDeviceRegistrationId },
  }) {
    const user = await User.getById(userId);
    const deviceRegistrationIds = [...user.deviceRegistrationIds];

    // Add new registration id
    if (newDeviceRegistrationId && !deviceRegistrationIds.includes(newDeviceRegistrationId)) {
      deviceRegistrationIds.push(newDeviceRegistrationId);
    }

    // Remove old registration id
    if (oldDeviceRegistrationId && deviceRegistrationIds.includes(oldDeviceRegistrationId)) {
      deviceRegistrationIds.splice(deviceRegistrationIds.indexOf(oldDeviceRegistrationId), 1);
    }

    await User
      .update({ deviceRegistrationIds })
      .where({ id: userId });
  },
};
