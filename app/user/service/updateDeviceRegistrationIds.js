import typeCheck from '#whiteroom/util/typeCheck.js';

import {
  ALL_ROLES,
} from '#user/constants/roles.js';

import User from '#user/model/userRepository.js';

export default {
  roles: ALL_ROLES,
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
