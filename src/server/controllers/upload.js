import formidable from 'formidable';
import { basename } from 'path';

const config = __config.filesystem;

/**
 * Generic file upload endpoint.
 */
export default {
  path: '/file',
  method: 'post',
  handler: async (req, res) => {
    const { files } = await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();

      form.uploadDir = config.tmp;
      form.maxFieldsSize = 5 * 1024 * 1024; // 5mb
      form.keepExtensions = true;
      form.type = true;

      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.file) {
      return res.status(400).send('Bad Request');
    }

    res.send({ file: basename(files.file.path) });
  }
};
