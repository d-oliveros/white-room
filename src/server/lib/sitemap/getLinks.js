/* eslint-disable no-multi-spaces */
import { map } from 'lodash';

const base = __config.server.host;

export default async function getLinks() {
  const { Post, User, Tag } = require('../../models');
  const now = Date.now();

  // Static pages
  let links = [
    { url: base,              changefreq: 'daily',  priority: 1.0 },
    { url: `${base}/tags`,    changefreq: 'weekly', priority: 0.8 },
    { url: `${base}/about`,   changefreq: 'yearly', priority: 0.4 },
    { url: `${base}/privacy`, changefreq: 'yearly', priority: 0.3 }
  ];

  // Post pages
  const postsQuery = {
    active: true,
    askedToPath: { $exists: true },
    path: { $exists: true },
    $nor: [
      { comments: { $exists: false }},
      { comments: { $size: 0 }}
    ]
  };

  const postsSelect = {
    path: true,
    askedToPath: true,
    created: true
  };

  const posts = await Post.find(postsQuery).select(postsSelect).lean();

  links = links.concat(map(posts, ({ askedToPath, path }) => {
    return {
      url: `${base}/${askedToPath}/questions/${path}`,
      priority: 0.6,
      changefreq: 'monthly'
    };
  }));

  // Tag pages
  const tags = await Tag
    .find({ count: { $gt: 0 }})
    .select({ slug: true, count: true })
    .lean();

  links = links.concat(tags.map(({ slug, count }) => {
    return {
      url: `${base}/tags/${slug}`,
      priority: count > 30 ? 0.6 : 0.5,
      changefreq: count > 30 ? 'daily' : 'monthly'
    };
  }));

  // User pages
  const usersQuery = {
    active: true,
    path: { $exists: true },
    managed: { $ne: true },
    'roles.admin': { $ne: true }
  };

  const usersSelect = {
    path: true,
    'counts.answers': true,
    'logs.lastAnswer': true
  };

  const users = await User.find(usersQuery).select(usersSelect).lean();

  links = links.concat(map(users, ({ path, logs = {}, counts = {} }) => {
    const url = `${base}/${path}`;

    const priority = !counts.answers
      ? 0.2
      : (counts.answers > 4)
        ? 0.8
        : 0.6;

    const changefreq = !logs.lastAnswer
      ? 'monthly'
      : (now - new Date(logs.lastAnswer).getTime() > 604800000)
        ? 'weekly'
        : 'daily';

    return { url, priority, changefreq };
  }));

  return links;
}
