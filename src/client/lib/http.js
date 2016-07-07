import request from 'superagent';
import { extend } from 'lodash';
import { stringify } from 'querystring';

const headers = {
  'Accept': 'application/json'
};

class Http {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  get(url, config) {
    return this.request('get', url, this.token, config);
  }

  post(url, data, config) {
    return this.request('post', url, this.token, config, data);
  }

  put(url, data, config) {
    return this.request('put', url, this.token, config, data);
  }

  delete(url, config) {
    return this.request('del', url, this.token, config);
  }

  upload(type, file, options) {
    const formData = new FormData();

    formData.append('file', file);

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    return this.post(`/upload/${type}`, formData);
  }

  file(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.post(`/file`, formData);
  }

  request(method, url, token, config = {}, data) {
    config = extend({ headers }, config);

    if (token) {
      config.headers.Authorization = token;
    }

    url = buildUrl(url, config.params);

    const promise = new Promise((resolve, reject) => {
      request[method](url)
        .send(data)
        .set(config.headers)
        .end((err, res) => {
          if (err && !res) {
            return reject({ data: null, status: 500 });
          }

          const status = res.status;

          if (status >= 200 && status < 300) {
            resolve(res.body || res.text);
          } else {
            reject({
              data: res.text,
              status: err.status
            });
          }
        });
    });

    return promise;
  }
}

function buildUrl(url, params) {
  const serializedParams = stringify(params);

  if (serializedParams.length > 0) {
    url += ((url.indexOf('?') === -1) ? '?' : '&') + serializedParams;
  }
  return url;
}

export default new Http();
