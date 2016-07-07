import { sitemap as Sitemap } from '../lib';

/**
 * Serves the sitemap.
 */
export default {
  path: '/sitemap.xml',
  method: 'get',
  async handler(req, res) {
    const sitemap = await Sitemap.toXML();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
    return sitemap;
  }
};
