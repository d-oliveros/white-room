
export default function(json) {
  const profile = {
    id: String(json.id),
    username: json.screen_name,
    displayName: json.name,
    photos: [{ value: json.profile_image_url_https }],
    profileUrl: `https://twitter.com/${json.screen_name}`
  };

  if (json.id_str) {
    profile.id = json.id_str;
  }

  profile.accessToken = json.access_token;
  profile.accessTokenSecret = json.access_token_secret;
  profile._json = json;

  return profile;
}
