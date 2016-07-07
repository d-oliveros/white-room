
export default function(json) {
  const profile = {
    provider: 'linkedin',
    id: json.id,
    displayName: json.firstName + ' ' + json.lastName,
    name: {
      familyName: json.lastName,
      givenName: json.firstName
    },
    profileUrl: json.publicProfileUrl
  };

  if (json.emailAddress) {
    profile.emails = [{ value: json.emailAddress }];
  }

  profile.accessToken = json.access_token;
  profile._json = json;

  return profile;
}
