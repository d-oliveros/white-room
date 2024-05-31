import { SitemapStream, streamToPromise } from 'sitemap';

import redis from '#server/db/redis.js';
import knex from '#server/db/knex.js';

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
async function generateSitemapXmlString() {
  const users = await knex('users').select(['id']);

  const userSitemapUrls = users.map((user) => ({
    url: `/users/${user.id}`,
    priority: 0.5,
    changefreq: 'monthly',
  }));

  const sitemapUrls = [
    ...sitemapStaticUrls,
    ...userSitemapUrls,
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

export default async function sitemapController(req, res, next) {
  try {
    let sitemapXmlString = await redis.getAsync(REDIS_SITEMAP_KEY);
    if (!sitemapXmlString) {
      sitemapXmlString = await generateSitemapXmlString();
      await redis.setexAsync(
        REDIS_SITEMAP_KEY,
        REDIS_SITEMAP_EXPIRATION_IN_SECONDS,
        sitemapXmlString,
      );
    }
    res.header('Content-Type', 'application/xml');
    res.send(sitemapXmlString);
  }
  catch (error) {
    next(error);
  }
}
