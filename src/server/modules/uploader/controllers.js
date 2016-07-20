import formidable from 'formidable';
import { basename } from 'path';
import assert from 'http-assert';
import createError from 'http-errors';
import promisify from 'es6-promisify';
import { parseJSON } from 'cd-common';
import { saveImage } from './lib';

const debug = __log.debug('whiteroom:controllers:uploadImage');
const config = __config.filesystem;

/**
 * Generic file uploader controller.
 */
export const fileUploadCtrl = async (req, res) => {
  try {
    const form = new formidable.IncomingForm();

    form.uploadDir = config.tmp;
    form.maxFieldsSize = 5 * 1024 * 1024; // 5mb
    form.keepExtensions = true;
    form.type = true;

    const parse = promisify(form.parse, form);
    const [, files] = await parse(req);

    if (!files.file) {
      throw createError(400);
    }

    res.send({ file: basename(files.file.path) });
  } catch (err) {
    __log.error(err);
    res.sendStatus(err.status || err.statusCode || 500);
  }
};

/**
 * Image uploader controller.
 */
export const imageUploadCtrl = async (req, res) => {
  try {
    const { type } = req.params;
    assert(!type || config.types[type], 409, `No config for file type ${type}`);

    // upload the file
    const form = new formidable.IncomingForm();

    form.uploadDir = config.tmp;
    form.maxFieldsSize = 5 * 1024 * 1024; // 5mb
    form.keepExtensions = true;
    form.type = true;

    debug(`Parsing incoming upload of type: ${type}`);

    const parse = promisify(form.parse, form);
    const [{ options = '{}' }, { file }] = await parse(req);

    // process the image with gm, save the image locally or in S3 bucket
    const parsedOptions = parseJSON(options);

    const params = Object.assign({ type }, { crop: parsedOptions.crop });

    debug(`Uploaded ${file.path}. Saving image with`, params);
    const filename = await saveImage(file.path, params);

    // returns the new image filename
    res.send({ image: filename });

  } catch (err) {
    __log.error(err);
    res.sendStatus(err.status || err.statusCode || 500);
  }
};
