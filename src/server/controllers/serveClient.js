import request from 'superagent';
import createError from 'http-errors';
import clientInitialState from '../../client/initialState';

const rendererServerEndpoint = process.env.RENDERER_ENDPOINT;

/**
 * Requests the fully rendered initial HTML from the client's renderer server.
 *
 * The initial client state is generated using data in "req",
 * which is populated in middleware steps.
 *
 * @see  app.js
 */
export default function serveClient(req, res, next) {
  const state = createInitialState(req);
  const { url } = req;

  request
    .post(rendererServerEndpoint)
    .send({ state, url })
    .end((err, rendererRes) => {
      if ((!rendererRes || !rendererRes.text) && !err) {
        err = createError(502, 'No response from the renderer server');
      }

      if (err) {
        return next(err);
      }

      if (req.benchmark && typeof req.benchmark.stop === 'function') {
        req.benchmark.stop();
      }

      res.send(rendererRes.text);
    });
}

/**
 * Extracts the initial state from the request
 */
function createInitialState(req) {

  // Builds the initial state
  const initialState = {
    currentUser: req.user ? req.user : clientInitialState().currentUser,
    sessionId: req.sessionId || null
  };

  // Adds the experiments
  if (req.experiments) {
    initialState.experiments = req.experiments;
  }

  // Notifies the client if this is a new site visit (aka 30 min sessions)
  if (req.isNewSession) {
    initialState.isNewSession = true;
  }

  return initialState;
}
