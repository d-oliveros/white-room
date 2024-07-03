import {
  API_ERROR_NOT_ALLOWED,
  API_ERROR_REQUEST_INVALID_RESPONSE,
  API_ERROR_REQUEST_FAILED,
  API_ERROR_REQUEST_NOT_HANDLED_OK,
  API_ERROR_ACTION_PAYLOAD_VALIDATION_FAILED,
} from '#common/errorCodes.js';

const DEFAULT_USER_ERROR_MESSAGE = 'Oops! It seems like there\'s a problem. We apologize for the trouble.';

const handleUserErrorMessages = ({ error, shortId }) => {
  const defaultErrorMessageWithId = (
    DEFAULT_USER_ERROR_MESSAGE + (shortId
      ? ` Please share this code with Support: ${shortId}`
      : ''
    )
  );

  // Message was handled previously.
  if (String(error.name).toLowerCase() !== 'error') {
    // Evaluate errors that require a error.message
    // update to be more user friendly.
    switch (error.name) {
      case API_ERROR_NOT_ALLOWED:
        if (error.message.includes('Request session roles')) {
          return defaultErrorMessageWithId;
        }
        return error.message;
      case API_ERROR_ACTION_PAYLOAD_VALIDATION_FAILED:
        if (error.message.includes('Payload validation failed')) {
          return defaultErrorMessageWithId;
        }
        return error.message;
      case API_ERROR_REQUEST_INVALID_RESPONSE:
      case API_ERROR_REQUEST_FAILED:
      case API_ERROR_REQUEST_NOT_HANDLED_OK:
        return defaultErrorMessageWithId;
      default:
        // Keep the error message as it is since
        // it has been managed by other methods.
        return error.message;
    }
  }
  // Set default error message.
  return defaultErrorMessageWithId;
};

export default handleUserErrorMessages;
