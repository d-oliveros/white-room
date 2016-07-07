import { map } from 'lodash';

export default function(json) {
  const profile = {
    provider: 'google',
    id: json.sub,
    displayName: json.name,
    gender: json.gender,
    profileUrl: json.profile
  };

  if (json.name) {
    profile.name = {
      familyName: json.family_name,
      givenName: json.given_name
    };
  }

  if (json.emails) {
    profile.emails = map(json.emails, (email) => {
      return {
        value: email.value,
        type: email.type
      };
    });
  }

  if (json.email) {
    if (!profile.emails) {
      profile.emails = [];
    }

    profile.emails.push({
      value: json.email
    });
  }

  if (json.image) {
    profile.photos = [{ value: json.image.url }];
  }

  profile.accessToken = json.access_token;
  profile._json = json;

  return profile;
}
