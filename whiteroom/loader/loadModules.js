import { readdir } from 'fs/promises';
import { resolve } from 'path';

import loadModule from './loadModule.js';

const loadModules = async (modulesDir) => {
  const entries = await readdir(modulesDir, { withFileTypes: true });
  const directoryEntries = entries.filter((entry) => entry.isDirectory());

  const promises = directoryEntries.map((entry) => {
    return loadModule(resolve(modulesDir, entry.name));
  });

  const results = await Promise.allSettled(promises);

  const modules = {};
  const errors = [];

  results.forEach((result, index) => {
    const { name } = directoryEntries[index];
    if (result.status === 'fulfilled') {
      if (result.value) {
        modules[name] = result.value;
      }
    }
    else {
      errors.push(new Error(`Failed to load module "${name}"`, { cause: result.reason }));
    }
  });

  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, 'Some modules failed to import.');
  }

  // Attempt to load the routes file separately
  try {
    const routesPath = resolve(modulesDir, 'routes.js');
    const routes = await import(routesPath);

    if (routes) {
      modules.routes = routes.default || routes;
    }
  }
  catch (err) {
    throw new Error('Failed to load routes', { cause: err });
  }

  return modules;
};

export default loadModules;
