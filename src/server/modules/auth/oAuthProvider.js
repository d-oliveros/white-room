import twitter from 'twitter-oauth-agent';
import google from 'google-oauth-agent';
import facebook from 'facebook-oauth-agent';
import linkedin from 'linkedin-oauth-agent';
import profiles from './profiles';

const providers = {
  twitter,
  google,
  facebook,
  linkedin
};

export default function oAuthProvider(provider, options) {
  return new Promise((resolve, reject) => {
    providers[provider](options, (err, profile) =>
      err ? reject(err) : resolve(profiles[provider](profile))
    );
  });
}
