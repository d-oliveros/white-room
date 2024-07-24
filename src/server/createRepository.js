import knex from '#white-room/server/db/knex.js';

const createRepository = async (tableName, methods) => {
  const repository = new Proxy(methods || {}, {
    get(target, name) {
      if (name in target) {
        return target[name];
      }
      const _repository = knex(tableName);
      return typeof _repository[name] === 'function'
        ? _repository[name].bind(_repository)
        : _repository[name];
    },
  });

  return repository;
};

export default createRepository;
