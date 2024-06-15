import fs from 'fs';
import { promisify } from 'util';

export default fs.writeFile
  ? promisify(fs.writeFile.bind(fs))
  : fs.writeFile;
