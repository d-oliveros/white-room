import { URL } from 'url';

export default function parseS3Url(s3Url) {
  if (!s3Url) {
    return false;
  }
  try {
    const parsedUrl = new URL(s3Url);
    if (parsedUrl.hostname !== 's3.amazonaws.com') {
      return false;
    }

    const regex = /^\/([^/]+)\/(.*)$/;
    const match = parsedUrl.pathname.match(regex);
    if (!match) {
      return false;
    }

    const [, bucket, key] = match;
    return {
      bucket: bucket,
      key: decodeURIComponent(key),
    };
  } catch (error) {
    return false;
  }
}