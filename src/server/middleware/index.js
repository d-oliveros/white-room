import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { loadModules } from '#common/util/loadModules.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modulesDirectory = resolve(__dirname);

const modules = await loadModules(modulesDirectory);

export default modules;
