import gm from 'gm';
import mkdirp from 'mkdirp';
import { each } from 'lodash';
import promisifyAll from 'es6-promisify-all';
import path from 'path';
import s3 from './s3';

promisifyAll(gm.prototype);

const debug = __log.debug('whiteroom:modules:filesystem');
const bucket = process.env.AWS_S3_BUCKET;
const config = __config.filesystem;
const FORMAT = 'jpg';

/**
 * Saves an image located in [source].
 * The image must've been previously uploaded, presumably in a tmp directory.
 *
 * @param  {String} source       The file name to process.
 * @param  {String} options.type The file type, as configured in /config/filesystem
 * @param  {Object} options.crop Crop parameters. This is optional.
 *
 * @return {Promise}
 */
export async function saveImage(source, { type, crop }) {
  const sizes = config.types[type].sizes;
  const filename = getFilename(source);

  debug(`Saving image ${source} of type ${type}`, { crop });

  // processes the image for each configured image size
  await Promise.all(sizes.map(async (size) => { //eslint-disable-line
    debug(`Processing ${size}`);

    let chain = gm(source);

    // crop the image
    if (crop && size !== 'original') {
      const fileDimensions = await gm(source).sizeAsync();

      const scale = fileDimensions.width / crop.imageWidth;

      const params = {
        x: Math.round(crop.x * scale),
        y: Math.round(crop.y * scale),
        width: Math.round(crop.width * scale),
        height: Math.round(crop.height * scale)
      };

      debug('Cropping with', { scale, crop, params, fileDimensions });

      chain = chain.crop(params.width, params.height, params.x, params.y);
    }

    // resize the image
    if (!isNaN(size)) {
      chain = chain.resize(size, size);
    }

    // sets new image format
    chain = chain.setFormat(FORMAT);

    // saves the processed image
    chain.writeAsync(`${config.root}/${type}/${size}/${filename}`);

    // upload the processed image to a S3 bucket
    await uploadToBucket(filename, { type, size });
  }));

  debug('Finished saving image.');
}

/**
 * Creates the required file upload directory structure locally.
 * @return {undefined}
 */
export function ensurePaths() {
  each(config.types, (entry, type) => {
    for (const size of entry.sizes || []) {
      const uploadDirPath = path.join(config.root, type, size);
      mkdirp.sync(uploadDirPath);
    }
  });
}

function getFilename(filepath) {
  const filename = path.basename(filepath);
  const ext = path.extname(filepath);

  return ext
    ? filename.replace(ext, `.${FORMAT}`)
    : `${filename}.${FORMAT}`;
}

async function uploadToBucket(filename, { type, size }) {
  const { types } = config;

  if (!types[type].s3) {
    return;
  }

  const path = `${type}/${size}/${filename}`;

  debug(`Uploading to S3 bucket: ${path}`);

  return s3.upload({
    localFile: `${config.root}/${path}`,
    s3Params: {
      Bucket: bucket,
      Key: `uploads/${path}`
    }
  });
}
