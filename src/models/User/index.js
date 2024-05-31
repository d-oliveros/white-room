import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import knex from '#server/db/knex.js';
import loadModules from '#common/util/loadModules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const modulesDirectory = resolve(__dirname);

const modules = await loadModules(modulesDirectory, __filename);

const UserModel = new Proxy(modules, {
  get(target, name) {
    if (name in target) {
      return target[name];
    }
    const _User = knex('users');
    return typeof _User[name] === 'function'
      ? _User[name].bind(_User)
      : _User[name];
  },
});

export default UserModel;
