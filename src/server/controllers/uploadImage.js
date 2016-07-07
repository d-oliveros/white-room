import formidable from 'formidable';
import { waterfall } from 'async';
import invariant from 'invariant';
import inspect from 'util-inspect';
import { extend } from 'lodash';
import { parseJSON } from 'cd-common';
import { saveImage } from '../lib/filesystem';

const debug = __log.debug('boilerplate:controllers:uploadImage');
const config = __config.filesystem;
const { types } = config;

/**
 * @todo  Change waterfall to async
 */
export default {
  path: '/upload/:type',
  method: 'post',
  handler: (req, res) => {
    const { type } = req.params;

    invariant(!type || types[type], `No config for file type ${type}`);

    return new Promise((resolve, reject) => {
      waterfall([

        // Upload the file
        (cb) => {
          const form = new formidable.IncomingForm();

          form.uploadDir = config.tmp;
          form.maxFieldsSize = 5 * 1024 * 1024; // 5mb
          form.keepExtensions = true;
          form.type = true;

          debug(`Parsing incoming upload of type: ${type}`);

          form.parse(req, cb);
        },

        // Process the file
        ({ options = '{}' }, { file }, cb) => {
          options = parseJSON(options);
          const params = extend({ type }, {
            crop: options.crop
          });

          debug(`Uploaded ${file.path}. Saving image with ${inspect(params)}`);

          saveImage(file.path, params).then((filename) => cb(null, filename), cb);
        }

      // On complete: Return the filename
      ], async (err, filename) => {
        if (err) return reject(err);
        const ret = { image: filename };
        res.send(ret);
        resolve(ret);
      });
    });
  }
};
