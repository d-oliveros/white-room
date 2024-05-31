import { USER_ROLE_ANONYMOUS } from '#common/userRoles.js';
import { API_ACTION_USER_UPDATE_DEVICE_REGISTRATION_IDS } from '#api/actionTypes';

export default async function updateDeviceRegistrationIds(
  { state, apiClient },
  { newDeviceRegistrationId, oldDeviceRegistrationId }
) {
  const userRoles = state.get(['currentUser', 'roles']);
  const isAnonymous = userRoles.includes(USER_ROLE_ANONYMOUS);

  if (!isAnonymous) {
    await apiClient.postWithState({
      action: API_ACTION_USER_UPDATE_DEVICE_REGISTRATION_IDS,
      state: state,
      payload: {
        newDeviceRegistrationId,
        oldDeviceRegistrationId,
      },
      onSuccess() {
        state.set(['mobileApp', 'deviceRegistrationId'], newDeviceRegistrationId);
        state.set(['mobileApp', 'askedPushNotificationPermission'], true);
      },
    });
  }
}
