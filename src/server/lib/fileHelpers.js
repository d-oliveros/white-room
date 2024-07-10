import formidable from 'formidable';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import os from 'os';

import logger from '#white-room/logger.js';
import typeCheck from '#white-room/util/typeCheck.js';

const debug = logger.createDebug('fileHelpers');

/**
 * Uploads an incoming file upload request to the directory in 'fileUploadDir'.
 *
 * @param {Object} req                  Express request object.
 * @param {string} params.field         Field name to get the file from.
 * @param {string} params.fileUploadDir Directory to upload the file to.
 * @param {number} params.maxFileSize   Maximum file size allowed, in bytes.
 *
 * @return {Promise<string>}            The uploaded file's absolute path.
 */
export async function uploadIncomingFile(req, params) {
  typeCheck('req::NonEmptyObject', req);
  typeCheck('params::NonEmptyObject', params);
  typeCheck('paramsField::NonEmptyString', params.field);
  typeCheck('paramsFileUploadDir::NonEmptyString', params.fileUploadDir);
  typeCheck('paramsMaxFileSize::PositiveNumber', params.maxFileSize);

  const form = new formidable.IncomingForm();

  form.uploadDir = params.fileUploadDir;
  form.maxFieldsSize = params.maxFileSize;
  form.keepExtensions = true;
  form.type = true;

  debug(`Uploading incoming file to "${params.fileUploadDir}"`);

  const parsedForm = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      else {
        resolve({
          file: files[params.field],
          fields: fields,
        });
      }
    });
  });

  if (!parsedForm || !parsedForm.file) {
    throw new Error(`No file on key "${params.field}" was uploaded`);
  }

  debug('Uploaded incoming file to', parsedForm.file.path);

  return parsedForm;
}

/**
 * Downloads a file into a local directory, or the operating system's tmp dir.
 *
 * @param {string} url        File URL to download.
 * @param {string} localPath  Local file path to save the file in.
 *
 * @return {Promise<string>}  The downloaded file's absolute path.
 */
export async function downloadFile(url, localFilePath) {
  // TODO(@d-oliveros): Test if the fetch refactor works!
  const downloadPath = localFilePath || `${os.tmpdir()}/${uuidv4()}`;
  const downloadStream = fs.createWriteStream(downloadPath);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const fileStream = response.body.pipe(downloadStream);

  const filePath = await new Promise((resolve, reject) => {
    fileStream.on('finish', () => {
      resolve(downloadStream.path);
    });
    fileStream.on('error', (error) => {
      reject(error);
    });
  });

  return filePath;
}

/**
 * Checks if a file exists.
 *
 * @param {string} filePath Absolute path to file to check.
 * @return {Promise<boolean, Error>} `true` if the file exists, `false` if it doesn't.
 */
export function checkFileExists(filePath) {
  typeCheck('filePath::NonEmptyString', filePath);

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (statError) => {
      if (statError) {
        if (statError.code === 'ENOENT') {
          resolve(false);
        }
        else {
          reject(statError);
        }
      }
      else {
        resolve(true);
      }
    });
  });
}

/**
 * Promise-based version of 'fs.unlink'. Also checks if file exists before deleting.
 *
 * @param  {string}  filePath  Absolute path to file to delete.
 * @return {Promise<boolean>}  True if file was deleted, false if file was not found.
 */
export function unlinkAsync(filePath) {
  typeCheck('filePath::NonEmptyString', filePath);

  return checkFileExists(filePath).then((fileExists) => {
    if (!fileExists) {
      return false;
    }
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (unlinkError) => {
        if (unlinkError) {
          reject(unlinkError);
        }
        else {
          resolve(true);
        }
      });
    });
  });
}

/**
 * Transforms a file path with template variables to file paths with actual variables,
 * and optionally sets the file extension if the original filePath doesn't have a file extension.
 *
 * @param  {string} filePath File path to use.
 * @return {string}          File path with template variables replaced.
 */
export function interpolateFilePath({ filePath, defaultExtension }) {
  typeCheck('filePath::NonEmptyString', filePath);
  typeCheck('defaultExtension::Maybe NonEmptyString', defaultExtension);

  const fileExtension = path.extname(filePath);

  return (
    filePath.replace(/{uuid}/g, uuidv4().replace(/-/g, '')) +
    (fileExtension ? '' : `.${defaultExtension}`)
  );
}

/**
 * Adds a numbered suffix to a string filepath
 * EX) somefilepath.jpg -> somefilepath-1.jpg
 *
 * @param  {string} filePath File path to use.
 * @param  {number} number   The number to append to the file as a suffix
 * @return {string}          File path with numbered suffix.
 */
export function addNumberedSuffix(filePath, number) {
  const lastIndexOfPeriod = filePath.lastIndexOf('.');
  return `${filePath.substring(0, lastIndexOfPeriod)}-${number}${filePath.substring(lastIndexOfPeriod)}`;
}

export function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, buffer) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(buffer);
    });
  });
}

/**
 * Recursively gets all files in a directory.
 *
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
export async function getFiles(dir) {
  const dirents = await fs.readdirSync(dir, { withFileTypes: true });

  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );

  return Array.prototype.concat(...files);
}
