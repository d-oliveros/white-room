import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

import {
  createApiServer,
  actionSpecsList,
} from '#api/index.js';

import { USER_ROLE_ADMIN } from '#common/userRoles.js';

import * as cookiesConfig from '#config/cookies.js';
import sitemapController from '#server/lib/sitemapController.js';
import sendgridWebhookApi from '#server/lib/sendgridWebhookApi.js';
import fileUploadsController from '#server/lib/fileUploadsController.js';
import pdfViewerController from '#server/lib/pdfViewerController.js';

import middleware from '#server/middleware/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  ENABLE_STORYBOOK,
  COOKIE_SECRET,
  COMMIT_HASH,
  SEGMENT_LIB_PROXY_URL,
} = process.env;

const ROOT_DIR = path.resolve(__dirname, '..', '..');

const {
  assetNotFound,
  unwrapSessionToken,
  handleCaps,
  extractInitialState,
  serveReactApp,
  serveCdnAssets,
  errorHandler,
  segmentLibProxy,
} = middleware;

const app = express();

// Server-level middleware
app.enable('trust proxy');

app.use((req, res, next) => {
  res.header('X-Served-By', 'node');
  res.header('X-App-Commit-Hash', COMMIT_HASH);
  next();
});

app.get('/health', (req, res) => res.sendStatus(200));
app.get('/sitemap.xml', sitemapController);

if (SEGMENT_LIB_PROXY_URL) {
  app.get('/sgmnt/:segmentApiKey/sgmntlib.min.js', segmentLibProxy);
}

app.get('/pdf-viewer', pdfViewerController);

app.use(serveCdnAssets);
app.use('/', express.static(path.join(ROOT_DIR, 'public')));

if (ENABLE_STORYBOOK === 'true') {
  app.use('/storybook', express.static(path.join(ROOT_DIR, '.storybook', 'dist')));
}

// Application-level middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/sendgrid/webhooks', sendgridWebhookApi);

// API server & misc server services.
app.use(cookieParser(COOKIE_SECRET, cookiesConfig.session));
app.use(unwrapSessionToken);
app.use('/api/v1', createApiServer(actionSpecsList, {
  sessionName: 'session',
  adminRoles: [
    USER_ROLE_ADMIN,
  ],
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
