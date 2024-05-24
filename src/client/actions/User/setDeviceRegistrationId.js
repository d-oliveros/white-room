export default async function setDeviceRegistrationId({ state }, { deviceRegistrationId }) {
  state.set(['mobileApp', 'deviceRegistrationId'], deviceRegistrationId);
  state.commit();
}
