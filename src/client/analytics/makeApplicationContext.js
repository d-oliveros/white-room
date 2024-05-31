import { v4 as uuidv4 } from 'uuid';
import url from 'url';

import {
  hasRoleAnonymous,
  hasRoleAdmin,
} from '#common/userRoles.js';

import isUserAgentMobileApp, {
  isUserAgentIphoneApp,
  isUserAgentAndroidApp,
} from '#common/util/isUserAgentMobileApp.js';

/**
 * Extracts application-specific contextual data from a state object.
 *
 * @param {Object} options.state               Application state.
 * @param {Object} options.navigationContext   Navigation context object.
 * @param {Object} options.state pageViewCount Page view count.
 * return {Object}
 */
export default function makeApplicationContext({ state, navigationContext, pageViewCount }) {
  const applicationContext = {};

  const {
    screenId,
    analyticsSessionId,
    utmValues,
    requestIp,
    location,
    userAgent,
    experiments: {
      activeVariants,
    },
  } = state.analytics;

  const user = state.currentUser;

  applicationContext.eventId = uuidv4();
  applicationContext.analyticsSessionId = analyticsSessionId;
  applicationContext.pageName = screenId;

  // User device flags.
  applicationContext.isMobile = userAgent.isMobile;
  applicationContext.isTablet = userAgent.isTablet;
  applicationContext.isBrowser = userAgent.isBrowser;
  applicationContext.isNativeAndroid = isUserAgentAndroidApp(userAgent);
  applicationContext.isNativeIphone = isUserAgentIphoneApp(userAgent);
  applicationContext.isNativeMobile = isUserAgentMobileApp(userAgent);

  applicationContext.userRoles = user.roles;

  applicationContext.isAnonymous = hasRoleAnonymous(user.roles);
  applicationContext.isAdmin = hasRoleAdmin(user.roles);

  if (!applicationContext.isAnonymous) {
    applicationContext.userId = user.id;
    applicationContext.userFirstName = user.firstName;
    applicationContext.userLastName = user.lastName;
    applicationContext.userProfileImage = user.profileImage;
    applicationContext.userPhone = user.phone;
    applicationContext.userEmail = user.email;
    applicationContext.userSignupProvider = user.signupProvider;
  }

  // UTM values.
  applicationContext.utmSource = utmValues.source;
  applicationContext.utmMedium = utmValues.medium;
  applicationContext.utmCampaign = utmValues.campaign;
  applicationContext.utmTerm = utmValues.term;
  applicationContext.utmContent = utmValues.content;

  // Experiments.
  applicationContext.experimentActiveVariants = JSON.stringify(activeVariants);
  Object.keys(activeVariants).forEach((experimentName) => {
    const activeVariant = activeVariants[experimentName];
    applicationContext[`experiment-${experimentName}`] = activeVariant;
  });

  // "Consecutive Page View Count" means page views without reloading the page (aka refreshing the browser).
  applicationContext.consecutivePageViewCount = pageViewCount;

  // Location values.
  applicationContext.requestIp = requestIp;
  applicationContext.locationCountry = (location || {}).country;
  applicationContext.locationRegion = (location || {}).region;
  applicationContext.locationCity = (location || {}).city;
  applicationContext.locationZip = String((location || {}).zip);
  applicationContext.locationLatitude = (location || {}).latitude;
  applicationContext.locationLongitude = (location || {}).longitude;

  // Navigation metadata.
  applicationContext.pageTitle = navigationContext.documentTitle;
  applicationContext.pageHref = navigationContext.locationHref;
  applicationContext.pageSearch = navigationContext.locationSearch;
  applicationContext.pagePath = navigationContext.locationPathname;
  applicationContext.pageHost = navigationContext.locationHostname;
  applicationContext.pageSearch = navigationContext.locationSearch;
  applicationContext.pagePort = navigationContext.locationPort;
  applicationContext.pageProtocol = navigationContext.locationProtocol;
  applicationContext.pageHash = navigationContext.locationHash;
  applicationContext.referrer = navigationContext.documentReferrer || '$direct';
  applicationContext.referringDomain = navigationContext.documentReferrer
    ? url.parse(navigationContext.documentReferrer).hostname || '$direct'
    : '$direct';

  // User viewport metadata.
  applicationContext.browserWidth = navigationContext.browserWidth;
  applicationContext.browserHeight = navigationContext.browserHeight;
  applicationContext.horizontalScroll = navigationContext.horizontalScroll;
  applicationContext.verticalScroll = navigationContext.verticalScroll;

  // User agent.
  applicationContext.userAgentBrowserName = userAgent.browserName;
  applicationContext.userAgentBrowserVersion = userAgent.browserVersion;
  applicationContext.userAgentDeviceType = userAgent.deviceType;
  applicationContext.userAgentDeviceVendor = userAgent.deviceVendor;
  applicationContext.userAgentDeviceModel = userAgent.deviceModel;
  applicationContext.userAgentEngineName = userAgent.engineName;
  applicationContext.userAgentEngineVersion = userAgent.engineVersion;
  applicationContext.userAgentOsName = userAgent.osName;
  applicationContext.userAgentOsVersion = userAgent.osVersion;
  applicationContext.userAgentCpuArchitecture = userAgent.cpuArchitecture;
  applicationContext.userAgentUserAgentString = userAgent.userAgentString;

  // Sanitize the application context object by removing empty values, except booleans and numbers.
  Object.keys(applicationContext).forEach((applicationContextFieldName) => {
    const applicationContextFieldValue = applicationContext[applicationContextFieldName];
    if (
      typeof applicationContextFieldValue !== 'boolean'
      && (typeof applicationContextFieldValue !== 'number' || isNaN(applicationContextFieldValue))
      && !applicationContextFieldValue
    ) {
      delete applicationContext[applicationContextFieldName];
    }
  });

  return applicationContext;
}
