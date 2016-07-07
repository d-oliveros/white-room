import { addRedirection } from '../lib';

export function add(req, res) {
  req.checkBody('source', 'Source is required.').notEmpty();
  req.checkBody('target', 'Target is required.').notEmpty();
  req.checkBody('code', 'Code is required.').notEmpty();

  if (req.validationErrors()) {
    return res.status(400).json(req.validationErrors());
  }

  addRedirection(req.body)
    .then(() => res.sendStatus(200))
    .catch((err) => res.status(500).json(err));
}

export default { add };
