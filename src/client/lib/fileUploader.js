import assert from 'assert';
import path from 'path';
import superagent from 'superagent';
import typeCheck from 'common/util/typeCheck';
import parseS3Url from 'common/util/parseS3Url';
import log from 'client/lib/log';

const debug = log.debug('fileUploader');

const UUID_V4_REGEX = /-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/;
const UNIX_DATE_REGEX = /-\d{13}/;
const UID_REGEX = /uid[0-9]+-/g;

/**
 * Removes specific timestamps and unique IDs from an S3 URL.
 */
export function sanitizeS3Url(s3Url) {
  return s3Url
    .replace(UUID_V4_REGEX, '')
    .replace(UNIX_DATE_REGEX, '')
    .replace(UID_REGEX, '');
}

/**
 * Creates a file object with various useful fields for storage or uploading via 'getFileBlobFromObjectUrl'.
 *
 * @param {File} file.
 *
 * @return {Object}
 */
export function createFileObjToBeUploaded(file) {
  assert(process.browser, 'createFileObjToBeUploaded is not available on server-side.');
  const fileInfoObject = {
    fileBlobUrl: global.URL.createObjectURL(file),
    uploadTime: Date.now(),
    preview: file.preview,
    name: file.name,
    size: file.size,
    type: file.type,
  };
  debug('Created file object to be uploaded', fileInfoObject);
  return fileInfoObject;
}

/**
 * Gets a Blob instance out of an objectURL string.
 *
 * @param   {string}  objectUrl  A string created with `URL.createObjectUrl()`.
 * @return  {Blob}               The file's blob.
 */
export function getFileBlobFromObjectUrl(objectUrl) {
  return new Promise((resolve, reject) => {
    typeCheck('objectUrl::NonEmptyString', objectUrl);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', objectUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = function onObjectUrlRead() {
      debug(`Loaded file blob for ${objectUrl}`, { status: this.status });
      if (this.status === 200) {
        resolve(this.response);
      }
      else {
        reject(new Error(`Failed to get file blob from object URL: ${objectUrl}`));
      }
    };
    xhr.send();
  });
}

export async function uploadFileToS3(fileObjToBeUploaded, params) {
  typeCheck('fileObjToBeUploaded::FileObject', fileObjToBeUploaded);
  typeCheck('params::NonEmptyObject', params);
  typeCheck('filePath::NonEmptyString', params.filePath);
  typeCheck('isPrivate::Maybe Boolean', params.isPrivate);
  typeCheck('uploadAs::Maybe PositiveNumber', params.uploadAs);

  const {
    name,
    fileBlobUrl,
  } = fileObjToBeUploaded;

  const {
    filePath,
    isPrivate,
    uploadAs,
  } = params;

  const fileBlob = await getFileBlobFromObjectUrl(fileBlobUrl);

  const originalFileExtension = path.extname(name)
    ? path.extname(name).replace('.', '')
    : '';

  const formData = new FormData();
  formData.append('file', fileBlob);
  formData.append('filePath', filePath);
  formData.append('fileExtension', originalFileExtension);
  formData.append('isPrivate', isPrivate);
  if (uploadAs) {
    formData.append('uploadAs', uploadAs);
  }

  const uploadResponse = await superagent.post('/upload-file', formData);
  const uploadResponseBody = uploadResponse.body;

  debug('Uploaded file', {
    fileObjToBeUploaded,
    params,
    uploadResponseBody,
  });

  if (!uploadResponseBody.success) {
    throw uploadResponseBody.error;
  }

  return uploadResponseBody.data;
}

export function makeProxiedS3FilePath(s3FileUrl, appUrl) {
  const parsedS3FileUrl = parseS3Url(s3FileUrl);

  if (!parsedS3FileUrl) {
    return s3FileUrl;
  }
  return `${appUrl || ''}/aws-s3/${parsedS3FileUrl.bucket}/${parsedS3FileUrl.key}`;
}

export function getImageDimension(fileUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.src = fileUrl;
  });
}

export async function getFileValidationError(fileObjectToBeUploaded, params) {
  const mimeType = fileObjectToBeUploaded.type;
  const { minWidth = 0, minHeight = 0 } = params;

  // Image size validation check
  if (
    (minWidth || minHeight)
    && !['application/pdf', 'image/heic'].includes(mimeType)
  ) {
    if (!mimeType.includes('image')) {
      return 'Invalid image file';
    }

    const imageDimension = await getImageDimension(fileObjectToBeUploaded.fileBlobUrl);
    if (imageDimension.width < minWidth || imageDimension.height < minHeight) {
      if (minWidth && minHeight) {
        return (
          'This image is too small, ' +
          `please upload an image that’s at least ${minWidth}px x ${minHeight}px in dimension.`
        );
      }
      if (minWidth) {
        return (
          'This image is too small, ' +
          `please upload an image that’s at least ${minWidth}px width.`
        );
      }
      return (
        'This image is too small, ' +
        `please upload an image that’s at least ${minHeight}px height.`
      );
    }
  }

  // Add more validation checks

  // No validation error, return null
  return null;
}

export function isPDFFile(filePath) {
  const fileExtension = (path.extname(filePath || '')).replace('.', '').toLowerCase();
  return fileExtension === 'pdf';
}
