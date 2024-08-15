import fs from 'fs';
import path from 'path';
import assert from 'assert';
import mime from 'mime';

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import logger from '#whiteroom/logger.js';
import typeCheck from '#whiteroom/util/typeCheck.js';
import parseQueryString from '#whiteroom/util/parseQueryString.js';

import {
  getFiles,
  unlinkAsync,
  readFileAsync,
} from '#whiteroom/server/lib/fileHelpers.js';

const debug = logger.createDebug('s3Client');

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_FILES_UPLOAD_BUCKET,
  AWS_REGION,
} = process.env;

export const isEnabled = !!(
  AWS_ACCESS_KEY &&
  AWS_SECRET_KEY &&
  AWS_FILES_UPLOAD_BUCKET
);

export const S3_ACL_PUBLIC_READ = 'public-read';
export const S3_ACL_AUTHENTICATED_READ = 'authenticated-read';

const client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const plugin = {
  applyToStack: (stack) => {
    stack.add(
      (next, context) => async (args) => {
        const startTimestamp = Date.now();
        const metadata = {
          clientName: context.clientName,
          commandName: context.commandName,
          bucket: args.input.Bucket,
          userId: args.input.userId,
        };

        logger.info(`${context.commandName}: ${args.input.Key} starts`, metadata);
        const result = await next(args);
        logger.info(
          `${context.commandName}: ${args.input.Key} in ${Date.now() - startTimestamp}ms`,
          metadata,
        );

        return result;
      },
      { step: 'deserialize', priority: 'low', tags: ['ROUND_TRIP'] },
    );
  },
};

client.middlewareStack.use(plugin);

export const s3BucketUrl = `https://s3.amazonaws.com/${AWS_FILES_UPLOAD_BUCKET}`;

export const withoutLeadingSlash = (pathString) => (
  pathString[0] === '/' ? pathString.slice(1) : pathString
);

/**
 * Downloads file from S3 bucket as a ReadableStream.
 */
export async function downloadStream(args) {
  typeCheck('args::NonEmptyObject', args);
  typeCheck('sourceFilePath::NonEmptyString', args.sourceFilePath);
  typeCheck('bucket::Maybe NonEmptyString', args.bucket);

  assert(isEnabled, 'AWS S3 env keys are not set');

  const { sourceFilePath, bucket } = args;

  const command = new GetObjectCommand({
    Bucket: bucket || AWS_FILES_UPLOAD_BUCKET,
    Key: sourceFilePath,
  });

  debug('Downloading file from S3 bucket as a ReadableStream', { args });

  const response = await client.send(command);
  return response.Body;
}

/**
 * Downloads file from S3 bucket as a buffer.
 */
export function downloadAsBuffer(args) {
  return new Promise((resolve, reject) => {
    try {
      typeCheck('args::NonEmptyObject', args);
      typeCheck('sourceFilePath::NonEmptyString', args.sourceFilePath);
      typeCheck('bucket::Maybe NonEmptyString', args.bucket);

      assert(isEnabled, 'AWS S3 env keys are not set');

      const { sourceFilePath, bucket } = args;

      const command = new GetObjectCommand({
        Bucket: bucket || AWS_FILES_UPLOAD_BUCKET,
        Key: sourceFilePath,
      });

      debug('Downloading file from S3 bucket', { args });

      client.send(command)
        .then((response) => {
          const stream = response.Body;
          const chunks = [];

          stream.on('data', (chunk) => chunks.push(chunk));
          stream.once('end', () => resolve(Buffer.concat(chunks)));
          stream.once('error', reject);
        })
        .catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Uploads a file to an S3 bucket.
 */
export async function uploadToS3(args) {
  typeCheck('args::NonEmptyObject', args);
  typeCheck('sourceFilePath::NonEmptyString', args.sourceFilePath);
  typeCheck('targetFilePath::NonEmptyString', args.targetFilePath);
  typeCheck('deleteSourceFile::Maybe Boolean', args.deleteSourceFile);
  typeCheck('bucket::Maybe NonEmptyString', args.bucket);
  typeCheck('isPrivate::Maybe Boolean', args.isPrivate);

  assert(isEnabled, 'AWS S3 env keys are not set');

  const { sourceFilePath, deleteSourceFile, bucket } = args;

  const acl = args.isPrivate ? S3_ACL_AUTHENTICATED_READ : S3_ACL_PUBLIC_READ;

  const targetFilePath = withoutLeadingSlash(args.targetFilePath);
  const blob = fs.readFileSync(sourceFilePath);

  const command = new PutObjectCommand({
    Bucket: bucket || AWS_FILES_UPLOAD_BUCKET,
    Key: targetFilePath,
    Body: blob,
    ACL: acl,
    ContentType: mime.getType(targetFilePath),
    userId: args.userId,
  });

  debug('Uploading file to S3 bucket', { args });

  await client.send(command);

  if (deleteSourceFile) {
    await unlinkAsync(sourceFilePath);
  }

  const uploadedFileUrl = `${s3BucketUrl}/${targetFilePath}`;

  debug('Uploaded file', uploadedFileUrl);

  return uploadedFileUrl;
}

export async function uploadToSignedS3ObjectUrl({ s3PutObjectUrl, localFilePath }) {
  typeCheck('s3PutObjectUrl::NonEmptyString', s3PutObjectUrl);
  typeCheck('localFilePath::NonEmptyString', localFilePath);

  debug('[uploadToSignedS3ObjectUrl] Uploading file to Signed S3 Object URL', {
    s3PutObjectUrl,
    localFilePath,
  });

  const fileBuffer = await readFileAsync(localFilePath);
  const headers = parseQueryString(s3PutObjectUrl.split('?')[1]);

  const options = {
    method: 'PUT',
    headers: {}
  };

  for (const headerName of Object.keys(headers)) {
    options.headers[headerName] = headers[headerName];
  }

  options.body = fileBuffer;

  const response = await fetch(s3PutObjectUrl, options);

  if (!response.ok) {
    throw new Error(`Failed to upload to signed S3 URL: ${response.statusText}`);
  }

  return response;
}

/**
 * Removes an object from an S3 bucket.
 */
export async function removeFromS3(args) {
  typeCheck('args::NonEmptyObject', args);
  typeCheck('targetFilePath::NonEmptyString', args.targetFilePath);

  const targetFilePath = withoutLeadingSlash(args.targetFilePath);

  const command = new DeleteObjectCommand({
    Bucket: AWS_FILES_UPLOAD_BUCKET,
    Key: targetFilePath,
  });

  debug('Removing file from S3 bucket', { args });

  await client.send(command);

  const removedFileUrl = `${s3BucketUrl}/${targetFilePath}`;

  debug('Removed file', removedFileUrl);

  return removedFileUrl;
}

/**
 * Uploads a directory to an S3 bucket.
 */
export async function uploadDirToS3({ dir, bucketName }) {
  const files = await getFiles(dir);

  for (const filePath of files) {
    await uploadToS3({
      sourceFilePath: filePath,
      targetFilePath: path.relative(dir, filePath),
      bucket: bucketName,
    });
  }
}
