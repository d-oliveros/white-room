import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import {
  createApiServer,
  actionSpecsList,
} from 'api';

import { USER_ROLE_ADMIN } from 'common/userRoles';

import sitemapController from './lib/sitemapController';
import sendgridWebhookApi from './lib/sendgridWebhookApi';
import fileUploadsController from './lib/fileUploadsController';
import pdfViewerController from './lib/pdfViewerController';

import {
  assetNotFound,
  unwrapSessionToken,
  handleCaps,
  extractInitialState,
  serveReactApp,
  serveCdnAssets,
  errorHandler,
  segmentLibProxy,
} from './middleware';

const {
  ENABLE_STORYBOOK,
  COOKIE_SECRET,
  COMMIT_HASH,
} = process.env;

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const app = express();

app.enable('trust proxy');

app.use((req, res, next) => {
  res.header('X-Served-By', 'node');
  res.header('X-App-Commit-Hash', COMMIT_HASH);
  next();
});

app.get('/health', (req, res) => res.sendStatus(200));
app.get('/sitemap.xml', sitemapController);
app.get('/sgmnt/:segmentApiKey/sgmntlib.min.js', segmentLibProxy);
app.get('/pdf-viewer', pdfViewerController);

app.use(serveCdnAssets);
app.use('/', express.static(path.join(ROOT_DIR, 'public')));

if (ENABLE_STORYBOOK === 'true') {
  app.use('/storybook', express.static(path.join(ROOT_DIR, '.storybook', 'dist')));
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// External service webhooks.
app.use('/sendgrid/webhooks', sendgridWebhookApi);

// API server & misc server services.
const adminRoles = [
  USER_ROLE_ADMIN,
];
app.use(cookieParser(COOKIE_SECRET, __config.session));
app.use(unwrapSessionToken);
app.use('/api/v1', createApiServer(actionSpecsList, {
  sessionName: 'session',
  adminRoles,
}));
app.post('/upload-file', fileUploadsController);

// React application server-side rendering.
app.use(assetNotFound);
app.use(handleCaps);
app.use(extractInitialState);
app.get('*', serveReactApp);

// Error handler.
app.use(errorHandler);

export default app;
