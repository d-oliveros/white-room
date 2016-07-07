
/**
 * Changes an experiment for this user.
 */
export default {
  path: '/setexperiment',
  method: 'post',
  async handler(req, res) {
    const { key, val } = req.body;
    const experiments = req.cookies.experiments || {};

    experiments[key] = val;

    res.cookie('experiments', experiments, __config.cookies);
    res.status(200).send('changed!');
  }
};
