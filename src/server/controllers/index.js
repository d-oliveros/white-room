import { Router } from 'express';
import { isObject, isFunction } from 'lodash';
import requireIndex from 'es6-requireindex';

/**
 * Creates a router by getting the routes represented by each file in this folder.
 */
const router = new Router();
const ctrls = requireIndex();

for (const key in ctrls) {
  if (ctrls.hasOwnProperty(key) && ctrls[key].path) {
    const { path, method, handler } = ctrls[key];

    // Register this path. Adds a catch-all controller wrapper
    router[method](path, wrap(handler));
  }
}

function wrap(handler) {
  return (req, res, next) => {
    try {
      const ret = handler(req, res, next);

      if (isObject(ret) && isFunction(ret.catch)) {
        ret.catch(next);
      }

    } catch (err) {
      return next(err);
    }
  };
}

// Exports a router with all the paths loaded
export default router;
