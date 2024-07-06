import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import loadModulesNode from '#white-room/util/loadModulesNode.js';
import knex from '#white-room/server/db/knex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modules = await loadModulesNode(`${__dirname}/methods`);

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
