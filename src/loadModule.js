import { readdir } from 'fs/promises';
import { extname, basename, dirname, resolve } from 'path';
import { cloneDeep, isEqual } from 'lodash-es';

import logger from './logger.js';

const jsFileRegex = /\.(j|t)sx?$/;

export const isJsFile = (filePath) => {
  return jsFileRegex.test(filePath);
};

export const importServiceModule = async (dirPath) => {
  const serviceModules = [];
  const files = await readdir(dirPath);

  for (const file of files) {
    if (isJsFile(file)) {
      const filePath = resolve(dirPath, file);
      const importedModule = await import(filePath);
      const moduleObject = importedModule.default || importedModule;

      if (typeof moduleObject === 'object') {
        if (typeof moduleObject.handler === 'function') {
          moduleObject.id = `${basename(dirname(dirPath))}.${file.replace(extname(file), '')}`;
          moduleObject.path ??= moduleObject.id.replace(/\./g, '/');
          serviceModules.push(moduleObject);
        }
        else {
          console.warn(`Warning: The module in ${filePath} does not have the 'handler' property.`);
        }
      }
    }
  }

  return serviceModules;
};

const importAndAssignModule = (filePath, targetObject, key, promises) => {
  const promise = import(filePath)
    .then(module => {
      targetObject[key] = module.default || module;
    });
  promises.push(promise);
};

const moduleSkeleton = {
  view: {
    routes: [],
    initialState: null,
  },
  crontab: {},
  middleware: null,
  service: [],
  models: {},
};

const loadModule = async (moduleDir) => {
  logger.info(`[loadModule] Loading module: ${moduleDir}`);

  // const moduleName = basename(moduleDir);
  const module = cloneDeep(moduleSkeleton);

  const entries = await readdir(moduleDir, { withFileTypes: true });
  const promises = [];

  for (const entry of entries) {
    const filePath = resolve(moduleDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'service') {
        const promise = importServiceModule(filePath)
          .then(serviceModules => module.service.push(...serviceModules));

        promises.push(promise);
      }
      else if (entry.name === 'view') {
        const viewEntries = await readdir(filePath, { withFileTypes: true });
        for (const viewEntry of viewEntries) {
          const viewFilePath = resolve(filePath, viewEntry.name);

          if (viewEntry.name === 'routes.js') {
            importAndAssignModule(viewFilePath, module.view, 'routes', promises);
          }
          else if (viewEntry.name === 'initialState.js') {
            importAndAssignModule(viewFilePath, module.view, 'initialState', promises);
          }
        }
      }
      else if (entry.name === 'model') {
        const modelEntries = await readdir(filePath, { withFileTypes: true });
        for (const modelEntry of modelEntries) {
          const modelFilePath = resolve(filePath, modelEntry.name);
          if (isJsFile(modelFilePath)) {
            // TODO: Implement
            // const modelName = basename(modelEntry.name, extname(modelEntry.name));
            // importAndAssignModule(modelFilePath, module.models, modelName, promises);
          }
        }
      }
    }
    else if (isJsFile(entry.name)) {
      if (entry.name === 'middleware.js') {
        importAndAssignModule(filePath, module, 'middleware', promises);
      }
      else if (entry.name === 'crontab.js') {
        importAndAssignModule(filePath, module, 'crontab', promises);
      }
    }
  }

  const results = await Promise.allSettled(promises);

  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);

  if (errors.length > 0) {
    throw new AggregateError(errors, 'One or more modules failed to load');
  }

  // Check if the module is empty and return null if it is
  const isEmptyModule = isEqual(module, moduleSkeleton);
  return isEmptyModule ? null : module;
};

export default loadModule;
