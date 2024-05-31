import { readdir } from 'fs/promises';
import { extname, resolve } from 'path';

/**
 * Dynamically imports all .js modules in the specified directory.
 * @param {string} directory - The directory to scan for modules.
 * @returns {Promise<object>} - An object containing all imported modules.
 */
export async function loadModules(directory) {
  const modules = {};
  const files = await readdir(directory);

  for (const file of files) {
    const filePath = resolve(directory, file);

    if (extname(file) === '.js') {
      const moduleName = file.replace('.js', '');
      modules[moduleName] = await import(filePath);
    }
  }

  return modules;
}
