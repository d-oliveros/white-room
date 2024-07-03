import { SitemapStream, streamToPromise } from 'sitemap';
import typeCheck from '#common/util/typeCheck.js';

import redis from '#server/db/redis.js';

const {
  APP_URL,
} = process.env;

export const REDIS_SITEMAP_KEY = 'sitemap';
export const REDIS_SITEMAP_EXPIRATION_IN_SECONDS = 3600; // An hour.

const sitemapStaticUrls = [
  { url: '/', priority: 1, changefreq: 'monthly' },
];

/**
 * Generates the sitemap string in XML format.
 * The sitemapUrls array contains objects with the format described in
 * https://github.com/ekalinin/sitemap.js/tree/master#example-of-using-sitemapjs-with-express.
 *
 * @return {string} The sitemap string in XML format.
 */
async function generateSitemapXmlString(urls) {
  const sitemapUrls = [
    ...sitemapStaticUrls,
    ...urls,
  ];

  const smStream = new SitemapStream({ hostname: APP_URL });

  for (const sitemapUrlObject of sitemapUrls) {
    smStream.write(sitemapUrlObject);
  }

  smStream.end();

  const sitemapObj = await streamToPromise(smStream);
  const sitemapString = sitemapObj.toString();
  return sitemapString;
}

export default function createSitemapController(modules) {
  typeCheck('modules::Maybe Modules', modules);

  return async (req, res, next) => {
    try {
      let sitemapXmlString = await redis.get(REDIS_SITEMAP_KEY);
      if (!sitemapXmlString) {

        const sitemapGeneratorPromises = (modules || [])
          .filter(({ sitemapGenerator }) => sitemapGenerator)
          .map(({ sitemapGenerator }) => sitemapGenerator());

        const urls = (await Promise.allSettled(sitemapGeneratorPromises))
          .reduce((memo, results) => [
            ...memo,
            (results.value || []),
          ],
            sitemapStaticUrls,
          );

        sitemapXmlString = await generateSitemapXmlString(urls);
        await redis.set(REDIS_SITEMAP_KEY, sitemapXmlString, {
          EX: REDIS_SITEMAP_EXPIRATION_IN_SECONDS
        });
      }
      res.header('Content-Type', 'application/xml');
      res.send(sitemapXmlString);
    }
    catch (error) {
      next(error);
    }
  }
}
