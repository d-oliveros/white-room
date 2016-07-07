
/**
 * Provides access to oauth configuration,
 * defined in environmental variables
 * and exposed in the browser through webpack
 */
export default {
  config: {
    google: {
      client_id    : process.env.OAUTH_GOOGLE_ID,
      scope        : process.env.OAUTH_GOOGLE_SCOPE,
      redirect_uri : process.env.OAUTH_GOOGLE_REDIRECT
    },
    facebook: {
      client_id    : process.env.OAUTH_FACEBOOK_ID,
      scope        : process.env.OAUTH_FACEBOOK_SCOPE,
      redirect_uri : process.env.OAUTH_FACEBOOK_REDIRECT
    },
    linkedin: {
      client_id    : process.env.OAUTH_LINKEDIN_ID,
      redirect_uri : process.env.OAUTH_LINKEDIN_REDIRECT
    }
  },
  share: {
    facebook: {
      client_id    : process.env.OAUTH_FACEBOOK_ID,
      redirect_uri : process.env.OAUTH_FACEBOOK_REDIRECT,
      scope        : ['publish_actions']
    },
    linkedin: {
      client_id    : process.env.OAUTH_LINKEDIN_ID,
      redirect_uri : process.env.OAUTH_LINKEDIN_REDIRECT,
      scope        : ['r_emailaddress', 'w_share']
    }
  },
  findFriends: {
    facebook: {
      client_id    : process.env.OAUTH_FACEBOOK_ID,
      redirect_uri : process.env.OAUTH_FACEBOOK_REDIRECT,
      scope        : ['user_friends']
    },
    google: {
      client_id    : process.env.OAUTH_GOOGLE_ID,
      scope        : 'https://www.googleapis.com/auth/plus.login',
      redirect_uri : process.env.OAUTH_GOOGLE_REDIRECT
    }
  },
  inviteContacts: {
    google: {
      client_id    : process.env.OAUTH_GOOGLE_ID,
      scope        : 'https://www.googleapis.com/auth/contacts.readonly',
      redirect_uri : process.env.OAUTH_GOOGLE_REDIRECT
    }
  },
  providers: {
    google         : require('google-oauth-agent'),
    twitter        : require('twitter-oauth-agent'),
    facebook       : require('facebook-oauth-agent'),
    linkedin       : require('linkedin-oauth-agent')
  }
};
