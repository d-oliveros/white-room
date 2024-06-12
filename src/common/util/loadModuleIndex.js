import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import loadModules from '#common/util/loadModules.js';

export default async function loadModuleIndex(metaUrl) {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);
  const modulesDirectory = resolve(__dirname);

  const modules = await loadModules(modulesDirectory, __filename);

  return modules;
}
