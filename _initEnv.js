import { fileURLToPath } from 'url';
import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const libDir = useBuild ? './lib' : './src';

const useBuild = process.env.USE_BUILD === 'true';

// Registers babel.
if (!useBuild) {
  const babelRegister = (await import('@babel/register')).default;
  babelRegister({
    extensions: ['.js', '.jsx', '.tsx'],
    ignore: [/node_modules/],
  });
  console.log('Registered Babel.');
}

// Loads the default environmental variables.
// await import(`${libDir}/util/loadenv.js`);
