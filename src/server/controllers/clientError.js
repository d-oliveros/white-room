
/**
 * Logs a client-side error.
 */
export default {
  path: '/log-client-error',
  method: 'post',
  handler: async (req, res) => {
    const { err, tags = [] } = (req.body || {});

    if (!err) return;

    if (req.user && req.user._id) {
      tags.push(`user-${req.user._id}`);
    }

    const args = tags.length ? [err, tags] : [err];

    __log.clientError.apply(__log, args);

    res.sendStatus(200);
  }
};
