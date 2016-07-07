import temp from 'temp';
import request from 'request';
import { waterfall } from 'async';
import { saveImage } from './index';

const debug = __log.debug('boilerplate:modules:filesystem');
const config = __config.filesystem;

export function download(url) {
  debug(`Downloading file in url: ${url}`);

  return new Promise((resolve, reject) => {
    const writeStream = temp.createWriteStream({ dir: config.tmp });
    const req = request(url).pipe(writeStream);

    writeStream.on('finish', () => {
      debug('Finished downloading file in url:', writeStream.path);
      writeStream.end();
      resolve(writeStream.path);
    });

    // Error handling
    writeStream.on('error', onError);
    req.on('error', onError);

    function onError(err) {
      if (!this.finished) {
        this.finished = true;
        __log.error(err);
        reject(err);
      }
    }

    onError.finished = false;
  });
}

export function downloadOAuthProfileImage(profile) {
  const provider = profile.provider;

  return new Promise((resolve, reject) => {
    waterfall([
      (cb) => {
        if (provider === 'facebook') {

          const url = `http://graph.facebook.com/v2.1/${profile.id}/picture?redirect=0&height=200&type=normal&width=200`;

          request(url, (err, res) => {
            if (err || res.statusCode !== 200) return cb(null, null);

            try {
              const json = JSON.parse(res.body);
              if (!json.data.url) {
                return cb(null, null);
              }

              debug('Downloading image from facebook');

              cb(null, json.data.url);
            } catch (err) {
              debug('Error in json parsing', err);
              cb(err);
            }
          });
        } else {
          let imageUrl = profile._json.pictureUrl
            || profile._json.avatar_url
            || profile._json.picture
            || profile._json.profile_image_url
            || (profile._json.image ? profile._json.image.url : null)
            || null;

          if (profile.provider === 'twitter') {
            imageUrl = imageUrl.replace('_normal', '');
          }

          cb(null, imageUrl);
        }
      },
      (imageUrl, cb) => {
        if (!imageUrl) return cb();

        download(imageUrl).then((filepath) => {
          return saveImage(filepath, { type: 'user' });
        }).then((filepath) => cb(null, filepath), cb);

      }
    ], (err, filepath) => {
      if (err) return reject(err);
      resolve(filepath);
    });
  });
}
