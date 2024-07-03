export default async function setMobileAppState(
  { state },
  {
    deviceRegistrationId,
    askedPushNotificationPermission,
    geolocationPermission,
    features,
  }
) {
  state.set(['mobileApp', 'deviceRegistrationId'], deviceRegistrationId);
  state.set(['mobileApp', 'askedPushNotificationPermission'], askedPushNotificationPermission);
  state.set(['mobileApp', 'geolocationPermission'], geolocationPermission);
  state.set(['mobileApp', 'features'], features || {});
  state.commit();
}
