import { Router } from 'express';
import { fileUploadCtrl, imageUploadCtrl } from './controllers';

const router = new Router();

router.post('/file', fileUploadCtrl);
router.post('/upload/:type', imageUploadCtrl);

export * as lib from './lib';
export * as httpUtil from './http-util';
export default router;
