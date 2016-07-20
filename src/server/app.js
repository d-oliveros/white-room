import path from 'path';
import express from 'express';
import less from 'less-middleware';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import promisify from 'es6-promisify';
import isomorphineAPI from './api';
import serveClient from './controllers/serveClient';
import middleware from './middleware';
import queueWebInterface from './modules/queue/web';
import { init as startCron } from './modules/cron';
import { api as authAPI } from './modules/auth';
import { server as socketServer } from './modules/websockets';
import fileUploader, { lib as uploaderLib } from './modules/uploader';
import { search, errorHandler } from './lib';

const env = process.env;
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const serveStatic = (dir) => express.static(path.resolve(ROOT_DIR, dir));

const app = express();

// Development environment
if (env.NODE_ENV !== 'production') {
  app.use(less(__config.less.path, __config.less.options));
  app.use('/build', serveStatic('build'));
  app.use('/', serveStatic('public'));
  app.get(/\.(img|png|jpg|jpeg)$/, (req, res) => res.sendStatus(404));
}

// Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(env.SECRET, __config.session));

// Middleware
app.use(middleware.decodeCookie);
app.use(middleware.validationHelpers);

// Handle API calls
app.use('/auth', authAPI);
app.use(isomorphineAPI.router);
app.use(fileUploader);
app.use(queueWebInterface);

// Handle site visit
app.use((req, res, next) => { req.isInitial = true; next(); });
app.use(middleware.benchmark);
app.use(middleware.handleCaps);
app.use(middleware.sessionCookie);
app.use(middleware.setExperiments);
app.use(middleware.populateUser);
app.use(middleware.trackSessionVisit);
app.get('*', serveClient);

// Error handler
app.use(errorHandler);

// Bootsraps the server's services
app.bootstrap = (port, callback) => {
  const server = http.createServer(app);
  uploaderLib.ensurePaths();
  socketServer.attachTo(server);
  search.bootstrap();
  startCron();
  server.listen(port, callback);
};

export default app;
