import { Router } from 'express';

const {
  AWS_BUNDLES_URL,
} = process.env;

const publicCdnFolders = [
  '/fonts',
  '/images',
  '/videos',
];

const router = new Router();

for (const cdnFolder of publicCdnFolders) {
  router.get(`${cdnFolder}/*`, (req, res, next) => {
    if (!AWS_BUNDLES_URL) {
      next();
      return;
    }
    res.redirect(301, `${AWS_BUNDLES_URL}${req.path}`);
  });
}

export default router;
