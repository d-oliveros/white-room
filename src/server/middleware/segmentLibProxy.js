import request from 'superagent';

export default function segmentAnalyticsLibController(req, res) {
  const { segmentApiKey } = req.params;
  const segmentJsLibUrl = (
    `https://cdn-sgmt.whiteroom.com/analytics.js/v1/${segmentApiKey}/analytics.min.js`
  );
  request(segmentJsLibUrl).pipe(res);
}
