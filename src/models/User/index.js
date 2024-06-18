import loadModulesNode from '#common/util/loadModulesNode.js';
import knex from '#server/db/knex.js';

const modules = await loadModulesNode(import.meta.url);

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
