export default function assetNotFound(req, res, next) {
  if (req.path.indexOf('.') > -1) {
    res.sendStatus(404);
  }
  else {
    next();
  }
}
