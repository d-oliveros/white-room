import common from '@${module}/util/typeCheck.js';

import client from '@${module}/lib/log.js';

export const MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED = 'MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED';
export const MOBILE_APP_ACTION_TYPE_OPEN_URL = 'MOBILE_APP_ACTION_TYPE_OPEN_URL';
export const MOBILE_APP_ACTION_TYPE_REQUEST_PUSH_NOTIFICATION_PERMISSION = 'MOBILE_APP_ACTION_TYPE_REQUEST_PUSH_NOTIFICATION_PERMISSION'; // eslint-disable-line max-len
export const MOBILE_APP_ACTION_TYPE_LOGOUT = 'MOBILE_APP_ACTION_TYPE_LOGOUT';
export const MOBILE_APP_ACTION_TYPE_RATE_APP = 'MOBILE_APP_ACTION_TYPE_RATE_APP';
export const MOBILE_APP_ACTION_TYPE_CURRENT_USER = 'MOBILE_APP_ACTION_TYPE_CURRENT_USER';
export const MOBILE_APP_ACTION_TYPE_GET_CURRENT_LOCATION = 'MOBILE_APP_ACTION_TYPE_GET_CURRENT_LOCATION'; // eslint-disable-line max-len
export const MOBILE_APP_ACTION_TYPE_ID_VERIFICATION = 'MOBILE_APP_ACTION_TYPE_ID_VERIFICATION';

const debug = log.debug('helpers:sendDataToMobileApp');

export default function sendDataToMobileApp(data) {
  typeCheck('data::NonEmptyObject', data);
  typeCheck('actionType::NonEmptyString', data.actionType);

  if (data.actionType === MOBILE_APP_ACTION_TYPE_ROUTE_CHANGED) {
    typeCheck('routePath::NonEmptyString', data.routePath);
    typeCheck('currentUser::NonEmptyObject', data.currentUser);
  }
  if (data.actionType === MOBILE_APP_ACTION_TYPE_CURRENT_USER) {
    typeCheck('currentUser::NonEmptyObject', data.currentUser);
  }
  if (data.actionType === MOBILE_APP_ACTION_TYPE_OPEN_URL) {
    typeCheck('url::NonEmptyString', data.url);
  }

  try {
    const dataToString = JSON.stringify(data);
    debug('data', data);
    if (global.ReactNativeWebView) {
      global.ReactNativeWebView.postMessage(dataToString);
    }
  }
  catch (error) {
    log.error(error);
  }
}
