import { readdir, stat } from 'fs/promises';
import { extname, dirname, resolve } from 'path';

const EXTENSION_REGEX = /\.jsx?$/;
const INDEX_REGEX = /index\.js$/;

/**
 * Dynamically imports all .js modules in the specified directory.
 * If a directory is found, it checks for an index.js file.
 *
 * @param {string} directory - The directory to scan for modules.
 * @param {string} [ignoreFile] - A file to ignore during the scan.
 * @returns {Promise<object>} - An object containing all imported modules.
 */
export default async function loadModulesNode(directory) {
  const modules = {};

  if (directory.startsWith('file://')) {
    directory = dirname(directory.replace('file://', ''));
  }

  try {
    const files = await readdir(directory);

    for (const file of files) {
      const filePath = resolve(directory, file);
      const moduleName = file.replace(EXTENSION_REGEX, '');


      if (INDEX_REGEX.test(filePath)) {
        continue;
      }

      const fileStat = await stat(filePath);

      if (EXTENSION_REGEX.test(extname(file))) {
        modules[moduleName] = await import(filePath);
        modules[moduleName] = modules[moduleName].default || modules[moduleName];
      }
      else if (fileStat.isDirectory()) {
        modules[moduleName] = await loadModulesNode(filePath);
      }
    }

    return modules;
  }
  catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(error);
    }
    return null;
  }
}
