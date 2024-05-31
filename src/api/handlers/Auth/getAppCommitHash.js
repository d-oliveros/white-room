import {
  API_ACTION_GET_APP_COMMIT_HASH,
} from '#api/actionTypes.js';

const {
  COMMIT_HASH,
} = process.env;

// The commit hash is returned as the API response body payload for this API handler,
// but the commit hash is also present in the "X-App-Commit-Hash" header
// included in all server HTTP responses.
export default {
  type: API_ACTION_GET_APP_COMMIT_HASH,
  handler: () => COMMIT_HASH,
};
