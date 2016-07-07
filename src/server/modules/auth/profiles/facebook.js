
export default function(json) {
  const profile = {
    provider: 'facebook',
    id: json.id,
    username: json.username,
    displayName: json.name,
    name: {
      familyName: json.last_name,
      givenName: json.first_name,
      middleName: json.middle_name
    },
    gender: json.gender,
    profileUrl: json.link
  };

  if (json.email) {
    profile.emails = [{ value: json.email }];
  }

  if (json.picture) {
    if (typeof json.picture === 'object' && json.picture.data) {
      profile.photos = [{ value: json.picture.data.url }];
    } else {
      profile.photos = [{ value: json.picture }];
    }
  }

  profile.accessToken = json.access_token;
  profile._json = json;

  return profile;
}
