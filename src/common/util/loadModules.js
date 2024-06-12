import { readdir, stat } from 'fs/promises';
import { extname, resolve } from 'path';

const EXTENSION_REGEX = /\.jsx?$/;

/**
 * Dynamically imports all .js modules in the specified directory.
 * If a directory is found, it checks for an index.js file.
 *
 * @param {string} directory - The directory to scan for modules.
 * @returns {Promise<object>} - An object containing all imported modules.
 */
export default async function loadModules(directory, ignoreFile) {
  const modules = {};
  const files = await readdir(directory);

  for (const file of files) {
    const filePath = resolve(directory, file);
    const moduleName = file.replace(EXTENSION_REGEX, '');

    if (filePath === ignoreFile) {
      continue;
    }
    const fileStat = await stat(filePath);

    if (EXTENSION_REGEX.test(extname(file))) {
      modules[moduleName] = await import(filePath);
      modules[moduleName] = modules[moduleName].default || modules[moduleName];
    }
    else if (fileStat.isDirectory()) {
      modules[moduleName] = await loadModules(filePath, ignoreFile);
    }
  }

  return modules;
}
