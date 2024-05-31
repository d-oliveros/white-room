import requireIndex from 'es6-requireindex';
import knex from '#server/db/knex.js';

const UserModel = new Proxy(requireIndex(), {
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
