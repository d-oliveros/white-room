import path from 'path';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import makeCookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

import typeCheck from '#white-room/util/typeCheck.js';
import * as cookiesConfig from '#white-room/config/cookies.js';

import createApiServer from '#white-room/api/createApiServer.js';

import createSitemapController from './lib/sitemapController.js';
import sendgridWebhookApi from './lib/sendgridWebhookApi.js';
import fileUploadsController from './lib/fileUploadsController.js';
import pdfViewerController from './lib/pdfViewerController.js';

import assetNotFound from './middleware/assetNotFound.js';
import unwrapSessionToken from './middleware/unwrapSessionToken.js';
import handleCaps from './middleware/handleCaps.js';
import serveCdnAssets from './middleware/serveCdnAssets.js';
import errorHandler from './middleware/errorHandler.js';
import segmentLibProxy from './middleware/segmentLibProxy.js';

const {
  ENABLE_STORYBOOK,
  COOKIE_SECRET,
  RENDERER_ENDPOINT,
  SEGMENT_LIB_PROXY_URL,
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const cookieParser = makeCookieParser(COOKIE_SECRET, cookiesConfig.session);

export function createServer({ services, sitemapGenerator, middleware, config = {} }) {
  typeCheck('config::Object', config);

  const {
    useHelmet,
    commitHash,
    rendererEndpoint,
  } = config;

  const app = express();

  // Gateway-level middleware
  if (useHelmet) {
    app.use(helmet());
  }

  app.enable('trust proxy');

  app.use((req, res, next) => {
    res.header('X-Served-By', 'node');
    res.header('X-App-Commit-Hash', commitHash || '');
    next();
  });

  // Server-level middleware
  app.get('/health', (req, res) => res.sendStatus(200));
  app.get('/sitemap.xml', createSitemapController(sitemapGenerator));
  app.get('/pdf-viewer', pdfViewerController);
  app.post('/upload-file', cookieParser, unwrapSessionToken, fileUploadsController);

  if (SEGMENT_LIB_PROXY_URL) {
    app.get('/sgmnt/:segmentApiKey/sgmntlib.min.js', segmentLibProxy);
  }

  if (ENABLE_STORYBOOK === 'true') {
    app.use('/storybook', express.static(path.join(ROOT_DIR, '.storybook', 'dist')));
  }

  app.use(serveCdnAssets);
  app.use('/', express.static(path.join(ROOT_DIR, 'public')));
  app.use(assetNotFound);

  // API-level middleware
  if (services.length > 0) {
    app.use('/api/v1', createApiServer(services));
  }

  // Application-level middleware
  app.use('/sendgrid/webhooks', bodyParser.json(), sendgridWebhookApi);

  // Attach custom middleware.
  if (typeof middleware === 'function') {
    middleware(app);
  }

  // Serves the React app
  if (rendererEndpoint) {
    app.get('*', handleCaps, createProxyMiddleware({
      target: RENDERER_ENDPOINT,
    }));
  }

  // Error handler.
  app.use(errorHandler);

  return app;
}
