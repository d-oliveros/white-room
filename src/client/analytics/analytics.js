import lodashGet from 'lodash/fp/get.js';

import {
  ROLE_ANONYMOUS,
} from '#user/constants/roles.js';

import logger from '#whiteroom/logger.js';
import makeApplicationContext from '#whiteroom/client/analytics/makeApplicationContext.js';

const debug = logger.createDebug('analytics');

function makeUserId(state) {
  return String(state.currentUser?.id || state.client.analytics.analyticsSessionId);
}

/**
 * Transforms a user data object to standard analytics traits.
 *
 * https://segment.com/docs/spec/identify/#traits
 *
 * @param  {Object} userData User data object to transform.
 * @return {Object} Standard identification traits.
 */
export function transformUserDataToSegmentIdentifyTraits(userData) {
  const [ firstName, ...lastNameParts ] = (userData.name || '').split(' ');

  return {
    avatar: userData.profileImage || undefined,
    email: userData.email || undefined,
    firstName: firstName || undefined,
    lastName: lastNameParts.join(' ') || undefined,
    name: userData.name || undefined,
    id: userData.id || undefined,
    phone: userData.phone || undefined,
    createdAt: userData.createdDate || undefined,
  };
}

/**
 * https://segment.com/docs/spec/common/
 *
 * @param  {Object} state
 * @return {Object} Common event parameters
 */
function makeCommonEventParams(state, navigationContext, integrations) {
  const {
    analytics: {
      analyticsSessionId,
      utmValues,
      requestIp,
      location,
    },
    env: {
      APP_ID,
      APP_TITLE,
      NODE_ENV,
    },
  } = state.client;

  const user = state.currentUser;

  const eventParams = {
    context: {
      app: {
        name: APP_TITLE,
        namespace: `com.${NODE_ENV === 'production' ? 'production' : 'development'}.${APP_ID}`,
      },
      ip: requestIp,
      location: location,
      screen: {
        width: navigationContext.browserWidth,
        height: navigationContext.browserHeight,
      },
    },
  };

  if (integrations) {
    eventParams.integrations = integrations;
  }

  if (user.roles.includes(ROLE_ANONYMOUS)) {
    eventParams.anonymousId = analyticsSessionId;
  }
  else if (user.id) {
    eventParams.userId = makeUserId(state);
  }

  if (utmValues && typeof utmValues === 'object') {
    eventParams.context.campaign = {
      name: (utmValues.campaign || undefined),
      source: (utmValues.source || undefined),
      medium: (utmValues.medium || undefined),
      content: (utmValues.content || undefined),
      term: (utmValues.term || undefined),
    };
  }

  return eventParams;
}

/**
 * Extracts relevant contextual data from a Window object.
 *
 * @param  {Window} _window  The global "window" object.
 * @return {Object} Relevant contextual metadata.
 */
function extractNavigationContextFromWindow(_window) {
  return {
    documentTitle: lodashGet('document.title', _window),
    documentReferrer: lodashGet('document.referrer', _window),
    locationHref: lodashGet('location.href', _window),
    locationPathname: lodashGet('location.pathname', _window),
    locationHostname: lodashGet('location.hostname', _window),
    locationSearch: lodashGet('location.search', _window),
    locationPort: lodashGet('location.port', _window),
    locationProtocol: lodashGet('location.protocol', _window),
    locationHash: lodashGet('location.hash', _window),
    browserWidth: _window.innerWidth
      || lodashGet('documentElement.clientWidth', _window.document)
      || lodashGet('body.clientWidth', _window.document),
    browserHeight: _window.innerHeight
      || lodashGet('documentElement.clientHeight', _window.document)
      || lodashGet('body.clientHeight', _window.document),
    scrollVertical: (
      (_window.pageYOffset || lodashGet('documentElement.scrollTop', _window.document))
      - (lodashGet('documentElement.clientTop', _window.document) || 0)
    ),
  };
}

export default {
  /**
   * Configures the analytics service instance.
   *
   * @param  {Window}   args._window  Window object.
   * @param  {Object}   args.store    Baobab store.
   * @param  {Function} args.onTrack  Function to be run after tracking an event.
   * @return {undefined}
   */
  configure({ _window, store, onTrack }) {
    this.store = store;
    this._window = _window;
    this.onTrack = onTrack;
  },

  /**
   * Checks if analytics is enabled for this user session.
   *
   * @return {boolean} True if analytics is enabled for this user session.
   */
  isAnalyticsEnabled() {
    const state = this.store.get();
    return (
      process.browser
      && state.client.analytics.isEnabled
      && !state.client.analytics.userAgent.isCrawler
    );
  },

  /**
   * Identifies a user.
   */
  identify() {
    const analyticsEnabled = this.isAnalyticsEnabled();
    const state = this.store.get();
    const user = state.currentUser;
    const userId = makeUserId(state);
    const isAnonymous = user.roles.includes(ROLE_ANONYMOUS);
    const navigationContext = extractNavigationContextFromWindow(this._window);
    const segmentTraits = isAnonymous
      ? null
      : transformUserDataToSegmentIdentifyTraits(user);

    const integrations = {
      All: true,
    };

    const commonEventParams = makeCommonEventParams(state, navigationContext, integrations);

    debug('Identifying', {
      user: user,
      isEnabled: analyticsEnabled,
      segmentTraits: segmentTraits,
      navigationContext: navigationContext,
      commonEventParams: commonEventParams,
    });

    if (analyticsEnabled) {
      this.safeAnalyticsCall('identify', userId, segmentTraits, commonEventParams);
    }
  },

  /**
   * Creates a user alias. This should be called after a user signup to attribute his old events to his new ID.
   *
   * https://segment.com/docs/spec/alias/
   *
   * @param {string|number} userId     The new user ID.
   * @param {string|number} userPrevId The previous user ID.
   */
  alias(userId, userPrevId) {
    const analyticsEnabled = this.isAnalyticsEnabled();

    debug('Aliasing', { userId, userPrevId, analyticsEnabled });

    if (analyticsEnabled) {
      this.safeAnalyticsCall('alias', String(userId), userPrevId);
    }
  },

  /**
   * Clears the analytics user state.
   */
  logout() {
    const analyticsEnabled = this.isAnalyticsEnabled();
    debug('Logging out', { analyticsEnabled });

    if (analyticsEnabled) {
      this.safeAnalyticsCall('reset');
    }
  },

  /**
   * Tracks an event.
   *
   * @param {string} eventType                    The event type.
   * @param {Object} originalEventProps           Extra properties to be attached to this event.
   * @param {Object} originalEventTrackingOptions Extra segment options to enable/disable only certain integrations, etc.
   */
  track(eventType, originalEventProps = {}, originalEventTrackingOptions = {}) {
    const analyticsEnabled = this.isAnalyticsEnabled();
    const state = this.store.get();
    const navigationContext = extractNavigationContextFromWindow(this._window);

    const applicationContext = makeApplicationContext({
      state: state,
      navigationContext: navigationContext,
    });

    const eventPayload = { ...applicationContext, ...originalEventProps };

    const commonEventParams = makeCommonEventParams(state, navigationContext);
    const eventTrackingOptions = { ...commonEventParams, ...originalEventTrackingOptions };

    const event = {
      type: eventType,
      payload: eventPayload,
      trackingOptions: eventTrackingOptions,
    };

    debug(`Tracking "${event.type}"`, { event, analyticsEnabled });

    if (analyticsEnabled) {
      // Track the event through Segment
      this.safeAnalyticsCall('track', event.type, event.payload, event.trackingOptions);

      this._eventLog = this._eventLog || [];
      this._eventLog.push({
        timestamp: Date.now(),
        event: event,
      });

      // Run any custom tracking handler
      if (typeof this.onTrack === 'function') {
        this.onTrack(event);
      }
    }
  },

  /**
   * Tracks a page view.
   */
  pageview() {
    const analyticsEnabled = this.isAnalyticsEnabled();
    const state = this.store.get();
    const navigationContext = extractNavigationContextFromWindow(this._window);

    if (analyticsEnabled) {
      const applicationContext = makeApplicationContext({
        state: state,
        navigationContext: extractNavigationContextFromWindow(this._window),
      });

      this.safeAnalyticsCall(
        'page',
        state.client.analytics.screenId,
        navigationContext.documentTitle,
        applicationContext,
      );
    }
  },

  /**
   * Makes a safe "window.analytics" call.
   *
   * @param  {string}  methodName  Method in Segment's analytics library to call
   * @param  {Array}   args        Destructured array with remaining function arguments
   * @return {boolean}             True if the method was called
   */
  safeAnalyticsCall(methodName, ...args) {
    if (!methodName) {
      const error = new Error('methodName is required.');
      throw error;
    }

    if (typeof lodashGet(`analytics.${methodName}`, this._window) !== 'function') {
      return false;
    }

    try {
      this._window.analytics[methodName](...args);
    }
    catch (error) {
      logger.error(error);
    }

    return true;
  },
};
