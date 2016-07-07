import { sortBy } from 'lodash';
import sm from 'sitemap';
import getLinks from './getLinks';

let urls = [];

let sitemap = {
  toXML: (callback) => callback()
};

export default {
  getUrls: () => urls,
  toXML: () => {
    return new Promise((resolve, reject) => {
      sitemap.toXML((err, xml) => {
        if (err) return reject(err);
        resolve(xml);
      });
    });
  },

  async loadSitemap() {
    const links = await getLinks();

    urls = urls.concat(links);
    urls = sortBy(urls, (url) => url.priority * -1);

    sitemap = sm.createSitemap({
      hostname: __config.host,
      cacheTime: 600000,
      urls: urls
    });

    return sitemap;
  }
};
