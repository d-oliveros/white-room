const {
  SEGMENT_LIB_PROXY_URL,
} = process.env;

export default async function segmentLibProxyController(req, res, next) {
  if (!SEGMENT_LIB_PROXY_URL) {
    next();
    return;
  }
  const { segmentApiKey } = req.params;
  const segmentJsLibUrl = `${SEGMENT_LIB_PROXY_URL}/analytics.js/v1/${segmentApiKey}/analytics.min.js`;

  try {
    const response = await fetch(segmentJsLibUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch segment library: ${response.statusText}`);
    }

    response.body.pipe(res);

    response.body.on('error', (error) => {
      next(error);
    });
  }
  catch (error) {
    next(error);
  }
}
