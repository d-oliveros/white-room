import gm from 'gm';
import mkdirp from 'mkdirp';
import { each } from 'lodash';
import inspect from 'util-inspect';
import async from 'async';
import path from 'path';
import s3 from '../s3';

const debug = __log.debug('boilerplate:modules:filesystem');
const bucket = process.env.AWS_S3_BUCKET;
const config = __config.filesystem;
const format = 'jpg';

export default {
  saveImage(source, { type, crop }) {
    return new Promise((resolve, reject) => {
      const sizes = config.types[type].sizes;
      const filename = getFilename(source);
      let fileDimensions;

      debug(`Saving image ${source} of type ${type}.\n${inspect({crop})}`);

      async.series([

        // Get the source image's dimensions
        (cb) => {
          if (!crop) return cb();

          gm(source).size((err, size) => {
            if (err) return cb(err);
            fileDimensions = size;
            cb();
          });
        },

        // Process each image size
        (cb) => {
          async.each(sizes, (size, callback) => {
            const newImagePath = `${config.root}/${type}/${size}/${filename}`;

            debug(`Processing ${size}`);

            let chain = gm(source);

            // Crop the image
            if (crop && size !== 'original') {

              const scale = fileDimensions
                ? fileDimensions.width / crop.imageWidth
                : 1;

              const params = {
                x: Math.round(crop.x * scale),
                y: Math.round(crop.y * scale),
                width: Math.round(crop.width * scale),
                height: Math.round(crop.height * scale)
              };

              debug(`Cropping with: ${inspect({scale, crop, params, fileDimensions})}`);

              chain.crop(params.width, params.height, params.x, params.y);
            }

            // Resize the image
            if (!isNaN(size)) {
              chain = chain.resize(size, size);
            }

            // Set format and process the new image
            chain.setFormat(format).write(newImagePath, (err) => {
              if (err) return callback(err);

              // Upload the processed image to a S3 bucket
              uploadToBucket(filename, { type, size }, callback);
            });
          }, cb);
        }
      ], (err) => {
        debug(`Finished saving image.`);
        if (err) return reject(err);
        resolve(filename);
      });
    });
  },

  ensurePaths() {
    each(config.types, (entry, type) => {
      each(entry.sizes || [], (size) => {
        const uploadDirPath = path.join(config.root, type, size);
        mkdirp.sync(uploadDirPath);
      });
    });
  }
};

function uploadToBucket(filename, { type, size }, callback) {
  const { types } = config;

  if (!types[type].s3) {
    return callback();
  }

  const path = `${type}/${size}/${filename}`;

  debug(`Uploading to S3 bucket: ${path}`);

  s3.upload({
    localFile: `${config.root}/${path}`,
    s3Params: {
      Bucket: bucket,
      Key: `uploads/${path}`
    }
  }).then(() => callback(null, filename), callback);
}

function getFilename(filepath) {
  const filename = path.basename(filepath);
  const ext = path.extname(filepath);

  return ext
    ? filename.replace(ext, `.${format}`)
    : `${filename}.${format}`;
}
