import temp from 'temp';
import request from 'request';
import promisify from 'es6-promisify';
import { saveImage } from './lib';

const requestAsync = promisify(request);
const debug = __log.debug('whiteroom:modules:filesystem');
const config = __config.filesystem;

/**
 * Downloads file in [url] to a local tmp directory.
 *
 * @param  {String} url File to download
 * @return {String}     New filename of the downloaded file.
 */
export async function download(url) {
  debug(`Downloading file in url: ${url}`);

  const writeStream = temp.createWriteStream({ dir: config.tmp });
  const req = request(url).pipe(writeStream);

  let finished = false;

  return await new Promise((resolve, reject) => {
    const onError = (err) => {
      if (!finished) {
        finished = true;
        __log.error(err);
        reject(err);
      }
    };

    writeStream.on('finish', () => {
      debug('Finished downloading file in url:', writeStream.path);
      writeStream.end();
      resolve(writeStream.path);
    });

    // Error handling
    writeStream.on('error', onError);
    req.on('error', onError);
  });
}

/**
 * Downloads the profile image of an OAuth profile.
 *
 * @param  {Object} profile Download the profile image of this OAuth profile
 * @return {String}         Filename of the downloaded profile image
 */
export async function downloadOAuthProfileImage(profile) {
  const provider = profile.provider;

  let profileImageUrl;

  // if this is a facebook profile, get a better version of their profile image
  if (provider === 'facebook') {
    const url = `http://graph.facebook.com/v2.1/${profile.id}/picture` +
      `?redirect=0&height=200&type=normal&width=200`;

    const res = await requestAsync(url);
    if (res.statusCode !== 200) return;
    const json = parseJSON(res.body);
    if (!json || !json.data || !json.data.url) return;

    profileImageUrl = json.data.url;

  } else {
    profileImageUrl = profile._json.pictureUrl
      || profile._json.avatar_url
      || profile._json.picture
      || profile._json.profile_image_url
      || (profile._json.image ? profile._json.image.url : null)
      || null;

    if (provider === 'twitter') {
      profileImageUrl = profileImageUrl.replace('_normal', '');
    }
  }

  if (!profileImageUrl) return;

  debug(`Downloading image from ${provider}`);

  const tmpFilename = await download(imageUrl);
  const filename = await saveImage(tmpFilename, { type: 'user' });

  return filename;
}
