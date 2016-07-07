import { clone, remove, find } from 'lodash';

const templates = [
  {
    name: 'personal website'
  },
  {
    name: 'Facebook',
    regex: /facebook.com/i
  },
  {
    name: 'Twitter',
    regex: /twitter.com/i
  },
  {
    name: 'LinkedIn',
    regex: /linkedin.com/i
  },
  {
    name: 'Google Plus',
    regex: /plus.google.com/i
  },
  {
    name: 'YouTube',
    regex: /youtube.com/i
  },
  {
    name: 'Instagram',
    regex: /instagram.com/i
  },
  {
    name: 'Tumblr',
    regex: /tumblr.com/i
  },
  {
    name: 'Medium',
    regex: /medium.com/i
  },
  {
    name: 'GitHub',
    regex: /github.com/i
  },
  {
    name: 'Quora',
    regex: /quora.com/i
  },
  {
    name: 'Pinterest',
    regex: /pinterest.com/i
  },
  {
    name: 'SoundCloud',
    regex: /soundcloud.com/i
  }
];

/**
 * Transforms an array of links, to an array of objects with information
 * regarding that social site.
 *
 * @see  '../constants/socialSites.js'
 *
 * @param  {Array}  links  An array of links
 * @return {Array}         An array of populated social site templates
 */
export function populate(links = []) {
  const cloned = clone(templates, true);

  const personalWebsite = remove(cloned, (template) => !template.regex).shift();
  personalWebsite.active = true;

  // Set social links
  const items = cloned.map((template) => {
    template = clone(template);
    template.url = find(links, (link) => template.regex.test(link)) || '';
    template.active = false;
    return template;
  });

  // Set the personal website link
  links.forEach((link) => {
    if (!find(items, { url: link })) {
      personalWebsite.url = link;
    }
  });

  items.unshift(personalWebsite);

  return items;
}

export default { populate };
