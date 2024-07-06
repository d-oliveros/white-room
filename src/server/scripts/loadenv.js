import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootdir = path.resolve(__dirname, '..', '..');

// loads the environment defined in the `.env` and `.env.default` files
try {
  fs.statSync('.env');
  dotenv.config({ path: path.join(rootdir, '.env') });
}
catch (e) { // eslint-disable-line no-empty
}

dotenv.config({
  path: path.join(rootdir, '.env.default'),
});
