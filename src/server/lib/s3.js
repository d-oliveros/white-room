import s3 from 's3';
import inspect from 'util-inspect';

const debug = __log.debug('boilerplate:modules:s3');
const { env } = process;

const S3Mock = {
  upload: async () => {},
  download: async () => {}
};

class S3 {
  constructor() {
    this.client = s3.createClient({
      s3Options: {
        accessKeyId: env.AWS_S3_ACCESS_KEY,
        secretAccessKey: env.AWS_S3_SECRET_KEY
      }
    });
  }

  /**
   * Upload a file to S3
   * @param  {Object} params Object parameters
   * @return {Promise}
   */
  upload(params) {
    debug(`Uploading ${inspect(params)}`);

    return new Promise((resolve, reject) => {
      const uploader = this.client.uploadFile(params);

      uploader.on('error', reject);
      uploader.on('end', resolve);
    });
  }

  /**
   * Download a file from S3
   * @param  {Object} params Object parameters
   * @return {Object}        Promise
   */
  download(params) {
    return new Promise((resolve, reject) => {
      const downloader = this.client.downloadFile(params);

      downloader.on('error', reject);
      downloader.on('end', resolve);
    });
  }
}


export default env.AWS_S3_ACCESS_KEY ? new S3() : S3Mock;
