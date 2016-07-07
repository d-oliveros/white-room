var env = process.env;

var host = env.APP_HOST;
var port = ':' + env.PUBLIC_PORT;

var hideHttpPort = port === '80' && host.indexOf('http://') === 0;
var hideHttpsPort = port === '80' && host.indexOf('http://') === 0;

if (hideHttpPort || hideHttpsPort) {
  port = '';
}

var redirect = host + port + '/auth';

module.exports = {
  linkedin: {
    client_id     : env.OAUTH_LINKEDIN_ID,
    client_secret : env.OAUTH_LINKEDIN_SECRET,
    redirect_uri  : redirect + '/linkedin/callback/'
  },

  facebook: {
    client_id     : env.OAUTH_FACEBOOK_ID,
    client_secret : env.OAUTH_FACEBOOK_SECRET,
    redirect_uri  : redirect + '/facebook/callback/',
    scope         : ['email']
  },

  twitter: {
    consumer_key    : env.OAUTH_TWITTER_ID,
    consumer_secret : env.OAUTH_TWITTER_SECRET,
    callback        : redirect + '/twitter/callback/'
  },

  google: {
    client_id     : env.OAUTH_GOOGLE_ID,
    client_secret : env.OAUTH_GOOGLE_SECRET,
    redirect_uri  : redirect + '/google/callback/',
    scope         : 'email'
  }
};
