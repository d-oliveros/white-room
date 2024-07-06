import { SitemapStream, streamToPromise } from 'sitemap';
import typeCheck from '#white-room/util/typeCheck.js';

import redis from '#white-room/server/db/redis.js';

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

export const makeSitemapGeneratorFromModules = async (modules) => {
  const sitemapGenerators = (modules || [])
    .filter(({ sitemapGenerator }) => sitemapGenerator)
    .map(({ sitemapGenerator }) => sitemapGenerator);

  return async () => {
    const sitemapGeneratorPromises = sitemapGenerators.map((generator) => generator());

    const urls = (await Promise.allSettled(sitemapGeneratorPromises))
      .reduce((memo, results) => [
        ...memo,
        ...(results.value || []),
      ],
        sitemapStaticUrls,
      );

    return urls;
  }
}

export default function createSitemapController(sitemapGenerator) {
  typeCheck('sitemapGenerator::Maybe Function|AsyncFunction', sitemapGenerator);

  return async (req, res, next) => {
    try {
      let sitemapXmlString = redis
        ? await redis.get(REDIS_SITEMAP_KEY)
        : null;

      if (!sitemapXmlString) {
        const urls = sitemapGenerator
          ? await sitemapGenerator()
          : [];

        sitemapXmlString = await generateSitemapXmlString(urls);

        if (redis) {
          await redis.set(REDIS_SITEMAP_KEY, sitemapXmlString, {
            EX: REDIS_SITEMAP_EXPIRATION_IN_SECONDS
          });
        }
      }
      res.header('Content-Type', 'application/xml');
      res.send(sitemapXmlString);
    }
    catch (error) {
      next(error);
    }
  }
}
