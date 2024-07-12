import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import loadModulesNode from '#white-room/util/loadModulesNode.js';
import knex from '#white-room/server/db/knex.js';

const createRepository = async (tableName, fileURL) => {
  const __filename = fileURLToPath(fileURL);
  const __dirname = dirname(__filename);

  const modules = await loadModulesNode(`${__dirname}/methods`);

  const repository = new Proxy(modules, {
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
