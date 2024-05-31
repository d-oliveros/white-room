import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import loadModules from '#common/util/loadModules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const modulesDirectory = resolve(__dirname);

const modules = await loadModules(modulesDirectory, __filename);

export default modules;
