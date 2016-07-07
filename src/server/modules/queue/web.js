import ui from 'kue-ui';
import { app as kueApp } from 'kue';
import { Router } from 'express';

ui.setup({
  apiURL: '/admin/queue/api',
  baseURL: '/admin/queue',
  updateInterval: 1700
});

const router = new Router();

router.use('/admin/queue', (req, res, next) => {
  if (!req.user || !req.user.roles.admin) {
    return res.redirect('/');
  }

  next();
});

router.use('/admin/queue/api', kueApp);
router.use('/admin/queue', ui.app);

export default router;
