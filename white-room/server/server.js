import path from 'path';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import makeCookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

import {
  createApiServer,
} from '#api/index.js';

import typeCheck from '#common/util/typeCheck.js';
import { USER_ROLE_ADMIN } from '#common/userRoles.js';

import * as cookiesConfig from '#config/cookies.js';
import createSitemapController from '#server/lib/sitemapController.js';
import sendgridWebhookApi from '#server/lib/sendgridWebhookApi.js';
import fileUploadsController from '#server/lib/fileUploadsController.js';
import pdfViewerController from '#server/lib/pdfViewerController.js';

import assetNotFound from '#server/middleware/assetNotFound.js';
import unwrapSessionToken from '#server/middleware/unwrapSessionToken.js';
import handleCaps from '#server/middleware/handleCaps.js';
import serveCdnAssets from '#server/middleware/serveCdnAssets.js';
import errorHandler from '#server/middleware/errorHandler.js';
import segmentLibProxy from '#server/middleware/segmentLibProxy.js';

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

export function createServer({ config = {}, modules }) {
  typeCheck('config::Object', config);
  typeCheck('modules::Maybe Modules', modules);

  const {
    useHelmet,
    setHeaders,
    commitHash,
    actionSpecsList,
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
    if (setHeaders) {
      setHeaders({ req, res });
    }
    next();
  });

  // Server-level middleware
  app.get('/health', (req, res) => res.sendStatus(200));

  app.get('/sitemap.xml', createSitemapController(modules));

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

  // Application-level middleware
  app.use('/sendgrid/webhooks', bodyParser.json(), sendgridWebhookApi);

  // API-level middleware
  if (actionSpecsList.length > 0) {
    app.use('/api/v1', createApiServer(actionSpecsList, {
      sessionName: 'session',
      adminRoles: [
        USER_ROLE_ADMIN,
      ],
    }));
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
