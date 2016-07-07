import url from 'url';
import inspect from 'util-inspect';
import { removeTrailingSlash, isURL } from 'cd-common';
import { downloadOAuthProfileImage } from '../../../lib/filesystem/http-util';

const debug = __log.debug('boilerplate:User:oAuthSignup');

export default async function oAuthSignup(profile) {
  const User = this;
  const provider = profile.provider;
  const extracted = User.extractFromOAuth(profile);
  let parsedUrl;

  debug(`Creating a new user from ${provider}: ${inspect(profile)}`);

  const providerData = {
    name: provider,
    id: profile.id
  };

  const user = {
    name: profile.displayName,
    providers: [providerData],
    signupProvider: provider
  };

  if (profile.email) {
    user.email = profile.email;
  } else {
    user.logs.onboardingState = 1;
  }

  if (profile.profileUrl) {
    user.socialSites.push(profile.profileUrl);
  }

  if (extracted.headline) {
    user.headline = extracted.headline;
  }

  if (extracted.summary) {
    user.summary = extracted.summary;
  }

  // Get other social sites from this profile
  let urls = [];

  if (typeof extracted.memberUrlResources === 'object' && extracted.memberUrlResources._total) {

    for (let i = 0, len = extracted.memberUrlResources.values.length; i < len; i++) {
      const site = extracted.memberUrlResources.values[i];
      urls.push(site);
    }
  }

  if (typeof profile._json.website === 'string') {
    let personalWebsite = profile._json.website;

    // Some providers stack up the personal websites in a single string (Ej. facebook)
    personalWebsite = personalWebsite.replace(/\r/g, '');
    personalWebsite = personalWebsite.split('\n')[0];

    if (personalWebsite.indexOf('http') < 0 && personalWebsite.indexOf('https') < 0) {
      personalWebsite = `http://${personalWebsite}`;
    }

    if (isURL(personalWebsite)) {
      urls.push({ name: 'Personal Website', url: personalWebsite });
    }
  }

  if (urls.length) {

    // Remove invalid urls
    urls = urls.filter((site) => !!site.url && isURL(site.url));

    // Build the socialsites array
    urls.forEach((site) => {
      parsedUrl = url.parse(site.url);
      parsedUrl.path = removeTrailingSlash(parsedUrl.path);

      ['github', 'twitter', 'facebook', 'stackoverflow'].forEach((platform) => {
        if (site.url.indexOf(`${platform}.com`) > -1 && provider !== platform) {
          user.socialSites[platform] = parsedUrl.path;
        }
      });

      if (site.name === 'Personal Website') {
        user.socialSites.website = site.url;
      }
    });
  }

  // Download the user's image
  const filename = await downloadOAuthProfileImage(profile);

  if (filename) {
    debug(`Setting image filename in user: ${filename}`);
    user.image = filename;
  }

  debug('Creating user');
  const newUser = await User.create(user);

  return newUser;
}
