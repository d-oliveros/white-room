import path from 'path';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import makeCookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

import logger from '#whiteroom/logger.js';
import typeCheck from '#whiteroom/util/typeCheck.js';
import * as cookiesConfig from '#whiteroom/config/cookies.js';

import createApiServer from '#whiteroom/api/createApiServer.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..', '..');

export function createServer({ services, sitemapGenerator, config = {} }) {
  logger.info('Creating server', config);

  typeCheck('config::Object', config);

  const {
    useHelmet,
    commitHash,
    rendererEndpoint,
    cookieSecret,
    enableStorybook,
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
  app.post(
    '/upload-file',
    makeCookieParser(config.cookieSecret, cookiesConfig.session),
    unwrapSessionToken,
    fileUploadsController,
  );

  if (config.segmentLibProxyUrl) {
    app.get('/sgmnt/:segmentApiKey/sgmntlib.min.js', segmentLibProxy);
  }

  if (enableStorybook === 'true') {
    app.use('/storybook', express.static(path.join(ROOT_DIR, '.storybook', 'dist')));
  }

  app.use(serveCdnAssets);
  app.use('/', express.static(path.join(ROOT_DIR, 'public')));
  app.use(assetNotFound);

  // API-level middleware
  if (services.length > 0) {
    app.use('/api/v1', createApiServer(services, { cookieSecret }));
  }

  // Application-level middleware
  app.use('/sendgrid/webhooks', bodyParser.json(), sendgridWebhookApi);

  // Serves the React app
  if (rendererEndpoint) {
    app.get('*', handleCaps, createProxyMiddleware({
      target: rendererEndpoint,
    }));
  }

  // Error handler.
  app.use(errorHandler);

  return app;
}
