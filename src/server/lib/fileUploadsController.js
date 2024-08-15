import os from 'os';
import { serializeError } from 'serialize-error';

import logger from '#whiteroom/logger.js';

import {
  uploadIncomingFile,
  interpolateFilePath,
} from '#whiteroom/server/lib/fileHelpers.js';

import {
  uploadToS3,
} from '#whiteroom/server/lib/s3Client.js';

export default async function fileUploadsController(req, res) {
  try {
    const parsedForm = await uploadIncomingFile(req, {
      field: 'file',
      maxFileSize: 20 * 1024 * 1024, // 20mb
      fileUploadDir: os.tmpdir(),
    });

    const isPrivate = typeof parsedForm.fields.isPrivate === 'boolean'
      ? parsedForm.fields.isPrivate
      : parsedForm.fields.isPrivate === 'true';

    const userId = res.locals.session && res.locals.session.userId || null;

    const uploadAsUserId = parsedForm.fields.uploadAs || userId;

    let filePath = interpolateFilePath({
      filePath: parsedForm.fields.filePath,
      defaultExtension: parsedForm.fields.fileExtension,
    });

    if (isPrivate && uploadAsUserId) {
      const filePathParts = filePath.split('/');
      filePathParts[filePathParts.length - 1] = `uid${uploadAsUserId}-${filePathParts[filePathParts.length - 1]}`; // eslint-disable-line max-len
      filePath = filePathParts.join('/');
    }

    const s3FileUrl = await uploadToS3({
      sourceFilePath: parsedForm.file.path,
      targetFilePath: filePath,
      deleteSourceFile: true,
      isPrivate: isPrivate,
      userId,
    });

    res.json({
      success: true,
      data: {
        s3FileUrl,
      },
    });
  }
  catch (error) {
    error.name = 'FileUploadError';
    logger.error(error);

    res.json({
      success: false,
      error: serializeError(error),
    });
  }
}
