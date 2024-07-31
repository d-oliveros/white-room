export default async function setMobileAppState(
  { state },
  {
    deviceRegistrationId,
    askedPushNotificationPermission,
    geolocationPermission,
    features,
  }
) {
  state.set(['client', 'mobileApp', 'deviceRegistrationId'], deviceRegistrationId);
  state.set(['client', 'mobileApp', 'askedPushNotificationPermission'], askedPushNotificationPermission);
  state.set(['client', 'mobileApp', 'geolocationPermission'], geolocationPermission);
  state.set(['client', 'mobileApp', 'features'], features || {});
  state.commit();
}
