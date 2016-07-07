import React from 'react';
import ls from 'local-storage';
import { emptyFunction } from 'cd-common';
import { config as authConfig, providers } from '../constants/auth';
import branch from '../core/branch';
import { http, log } from '../lib';

const debug = log.debug('OAuth');

@branch({
  twitterRequestToken: ['currentUser', 'twitterRequestToken'],
  sessionId: ['sessionId']
})

export default class OAuth extends React.Component {
  constructor() {
    super();
    this.requestAuthentication = ::this.requestAuthentication;
    this.onAuthentication = ::this.onAuthentication;
  }

  componentDidMount() {
    const { provider, actions } = this.props;

    if (provider === 'twitter') {
      actions.getTwitterRequestToken();
    }
  }

  requestAuthentication(e) {
    const { provider, twitterRequestToken, actions } = this.props;

    e.preventDefault();

    debug(`Clicking ${provider}`);

    if (provider !== 'twitter') {
      providers[provider](authConfig[provider], this.onAuthentication);
    } else {
      if (twitterRequestToken) {
        providers[provider](twitterRequestToken, this.onAuthentication);
        actions.removeTwitterRequestToken();
      } else {
        log.warn('No twitter data');
      }
    }
  }

  onAuthentication(err, data) {
    if (err) return log.error(err);

    const props = this.props;
    const { provider, onlyLogin, sessionId } = props;
    const onAuthentication = props.onAuthentication || emptyFunction;
    const onAuthenticationError = props.onAuthenticationError || emptyFunction;

    const params = provider === 'twitter' ? data : { code: data };

    params.sessionId = sessionId;
    params.appreciations = ls.get('appreciations') || [];

    if (onlyLogin) {
      params.onlyLogIn = true;
    }

    debug('Running callback', params);

    http.post(`/auth/${provider}`, params)
      .then(onAuthentication)
      .catch(onAuthenticationError);
  }

  render() {
    const { message, provider } = this.props;

    const linkProps = {
      onClick: this.requestAuthentication,
      target: '_self',
      rel: 'nofollow',
      href: '/',
      className: `oauth-button ${provider}`
    };

    return (
      <a { ...linkProps }>
        <span>{ message }</span>
      </a>
    );
  }
}
