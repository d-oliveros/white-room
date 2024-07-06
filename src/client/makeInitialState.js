/**
 * Makes the initial client state.
 */
export default function makeInitialState() {
  return {
    // THIS SECTION REPLACED BY REACT QUERY
    users: {
      byId: {},
    },

    // Client State
    isTransitioning: false,
    isNotFound: null,

    // Every property in this object will be passed to the initial frontend state
    // from the server's environment automatically. Add more environmental variables here
    // to expose them in the frontend. Careful - these will be public!
    env: {
      APP_ID: null,
      APP_URL: null,
      APP_TITLE: null,
      NODE_ENV: null,
      COMMIT_HASH: null,
    },

    pendingCommit: false,

    apiState: {},
    dataTables: {},
    browsingHistory: [],

    scroll: {
      shouldRestoreScrollPosition: false,
    },
    mobileApp: {
      isMobileApp: false,
      isPartnerApp: false,
      askedPushNotificationPermission: false,
      deviceRegistrationId: null,
      features: {},
      askForReview: false,
      askPushNotifications: false,
    },
    pageData: {},
    pageMetadata: {
      pageTitle: null,
      robots: null,
      keywords: null,
      description: null,
      image: null,
    },
    pageMetadataDefault: {
      pageTitle: null,
      robots: null,
      keywords: null,
      description: null,
      image: null,
    },
    analytics: {
      analyticsSessionId: null,
      shouldTrackNewSession: false,
      isEnabled: false,
      requestIp: null,
      location: {
        country: null,
        region: null,
        city: null,
        zip: null,
        lattitude: null,
        longitude: null,
      },
      utmValues: {
        campaign: null,
        source: null,
        medium: null,
        content: null,
        term: null,
      },
      experiments: {
        activeVariants: {},
        config: {},
      },
      userAgent: {
        browserName: null,
        browserVersion: null,
        deviceType: null,
        deviceVendor: null,
        deviceModel: null,
        engineName: null,
        engineVersion: null,
        osName: null,
        osVersion: null,
        cpuArchitecture: null,
        userAgentString: null,
        isMobile: null,
        isTablet: null,
        isBrowser: null,
        isCrawler: null,
      },
    },
  };
}
