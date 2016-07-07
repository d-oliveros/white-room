import { pick } from 'lodash';

const providerFields = {
  github: ['name', 'login', 'location', 'email', 'company', 'blog', 'followers', 'following', 'created_at', 'updated_at', 'public_repos', 'public_gists', 'html_url'],
  google: ['email', 'link', 'picture', 'gender', 'locale', 'blog', 'followers', 'following', 'created_at', 'updated_at', 'public_repos', 'public_gists', 'html_url'],
  linkedin: ['dateOfBirth', 'educations', 'industry', 'languages', 'memberUrlResources', 'numConnections', 'pictureUrl', 'positions', 'publicProfileUrl', 'skills'],
  facebook: ['name', 'link', 'gender', 'age_range', 'bio', 'email', 'picture', 'work', 'website'],
  twitter: ['name', 'url', 'screen_name']
};

export default function extractFromOAuth({ provider, _json }) {
  return pick(_json, providerFields[provider]);
}
