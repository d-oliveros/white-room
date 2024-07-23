import { register as tsNodeRegister } from 'ts-node/esm';
import { register as babelRegister } from './babel-esm-loader.js';
import { pathToFileURL } from 'node:url';

tsNodeRegister(pathToFileURL('./'));
babelRegister(pathToFileURL('./'));
