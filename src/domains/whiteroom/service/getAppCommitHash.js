const {
  COMMIT_HASH,
} = process.env;

// The commit hash is returned as the API response body payload for this API handler,
// but the commit hash is also present in the "X-App-Commit-Hash" header
// included in all server HTTP responses.
export default {
  path: '/whiteroom/getAppCommitHash',
  handler: () => COMMIT_HASH,
};
