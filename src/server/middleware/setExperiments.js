import { getExperiments } from '../lib/experiments';

export default function setExperiments(req, res, next) {
  const config = __config.experiments;
  const cookies = req.cookies;

  const { experiments, changed } = getExperiments(config, cookies.experiments);

  if (changed) {
    res.cookie('experiments', experiments, __config.cookies);
  }

  req.experiments = experiments;

  next();
}
