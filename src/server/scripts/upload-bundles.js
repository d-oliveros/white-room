import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { fileURLToPath } from 'url';

import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import logger from '#white-room/logger.js';

import {
  getFiles,
  unlinkAsync,
  checkFileExists,
} from '#white-room/server/lib/fileHelpers.js';

const {
  COMMIT_HASH,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const commitHashSuffix = COMMIT_HASH ? '-' + COMMIT_HASH : '';

const bundles = [
  {
    filePath: path.resolve(__dirname, `../../public/dist/bundle${commitHashSuffix}.js`),
    s3FilePath: `js/bundle${commitHashSuffix}.js`,
  },
  {
    filePath: path.resolve(__dirname, `../../public/dist/bundle${commitHashSuffix}.js.LICENSE.txt`),
    s3FilePath: `js/bundle${commitHashSuffix}.js.LICENSE.txt`,
  },
  {
    filePath: path.resolve(__dirname, `../../public/dist/bundle${commitHashSuffix}.js.map`),
    s3FilePath: `js/bundle${commitHashSuffix}.js.map`,
  },
  {
    filePath: path.resolve(__dirname, `../../public/dist/style${commitHashSuffix}.css`),
    s3FilePath: `css/style${commitHashSuffix}.css`,
  },
];

const folders = [
  'fonts',
  'images',
  'videos',
];

/**
 * Uploads the bundle files defined in the bundles list above.
 *
 * @return {undefined}
 */
export default async function uploadBundles() {
  if (!COMMIT_HASH) {
    const error = new Error('[uploadBundles] COMMIT_HASH is required.');
    error.name = 'UploadBundlesMissingConfigurationError';
    throw error;
  }

  const promises = bundles.map(async ({ filePath, s3FilePath }) => {
    logger.info(`[uploadBundles] Uploading ${filePath} -> ${s3FilePath}`);

    const fileExists = await checkFileExists(filePath);

    if (!fileExists) {
      const error = new Error(`[uploadBundles] Bundle "${filePath}" not found.`);
      error.name = 'UploadBundlesNotFoundError';
      error.details = {
        filePath,
        s3FilePath,
      };
      throw error;
    }

    await client.send(new PutObjectCommand({
      Bucket: 'bundles',
      Key: s3FilePath,
      ACL: 'public-read',
      Body: fs.readFileSync(filePath),
      ContentType: mime.getType(filePath),
    }));

    await unlinkAsync(filePath);
  });

  promises.push(...folders.map(async (folder) => {
    const localDir = path.join(__dirname, `../public/${folder}`);

    const files = await getFiles(localDir);

    for (const filePath of files) {
      const s3FilePath = filePath.replace(`${path.resolve(__dirname, '../public')}/`, '');
      await client.send(new PutObjectCommand({
        Bucket: 'bundles',
        Key: s3FilePath,
        ACL: 'public-read',
        Body: fs.readFileSync(filePath),
        ContentType: mime.getType(filePath),
      }));

      await unlinkAsync(filePath);
    }
  }));

  await Promise.all(promises);
}
