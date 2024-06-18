import request from 'superagent';

const {
  SEGMENT_LIB_PROXY_URL,
} = process.env;

export default function segmentLibProxyController(req, res, next) {
  if (!SEGMENT_LIB_PROXY_URL) {
    next();
    return;
  }
  const { segmentApiKey } = req.params;
  const segmentJsLibUrl = (
    `${SEGMENT_LIB_PROXY_URL}/analytics.js/v1/${segmentApiKey}/analytics.min.js`
  );
  request(segmentJsLibUrl).pipe(res);
}
