import path from 'path';
import { glob } from 'glob';
import { EntitySchema } from 'typeorm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.dirname(path.dirname(__dirname));

const getEntityScehmas = async (globPath) => {
  const entityFiles = await glob(globPath, { nocase: true });

  // Read the entity models from the current namespace, transform into entity schemas.
  const entitySchemas = (await Promise.all(entityFiles.map(async (filepath) => {
    const modules = await import(path.resolve(__root, filepath));
    const schemas = [];
    for (const moduleName of Object.keys(modules)) {
      const model = modules[moduleName];
      if (typeof model === 'object' && model.name && model.tableName && model.columns) {
        schemas.push(new EntitySchema(model));
      }
    }
    return schemas;
  }))).reduce((memo, schemas) => [...memo, ...schemas], []);

  return entitySchemas;
}

export default getEntityScehmas;
