import path from 'path';
import express from 'express';
import less from 'less-middleware';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import isomorphineAPI from './api';
import controllers from './controllers';
import serveClient from './controllers/serveClient';
import middleware from './middleware';
import queueWebInterface from './modules/queue/web';
import { init as startCron } from './modules/cron';
import { api as authAPI } from './modules/auth';
import { server as socketServer } from './modules/websockets';
import { filesystem, search, sitemap, errorHandler } from './lib';

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const serveStatic = (dir) => express.static(path.resolve(ROOT_DIR, dir));

const app = express();

// Development environment
if (__config.env !== 'production') {
  app.use(less(__config.less.path, __config.less.options));
  app.use('/build', serveStatic('build'));
  app.use('/', serveStatic('public'));
  app.get(/\.(img|png|jpg|jpeg)$/, (req, res) => res.sendStatus(404));
}

// Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.SECRET, __config.session));

// Middleware
app.use(middleware.decodeCookie);
app.use(middleware.validationHelpers);

// Handle API calls
app.use('/auth', authAPI);
app.use(isomorphineAPI.router);
app.use(controllers);
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

/**
 * Exposes a method that bootstraps the server's services.
 *
 * @param  {String|Number} port     Port to start the server in.
 * @param  {Function}      callback Function to run when the server has started.
 * @return {http.Server}            Newly created HTTP server handling the app.
 */
app.bootstrap = (port, callback) => {
  if (app.started) return callback(new Error('Server has already started'));

  if (__config.server.useBuild) {
    __log.warn('App: Using build files instead of development files.');
  }

  const server = app.listen(port, (err) => {
    if (err) return callback(err);
    app.started = true;

    // load the server's services
    filesystem.ensurePaths();
    socketServer.attachTo(server);
    search.bootstrap();
    startCron();
    sitemap.loadSitemap((err) => { if (err) __log.error(err); });
  });

  return server;
};

export default app;
