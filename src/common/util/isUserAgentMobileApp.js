const browserNames = ['WebKit', 'Chrome WebView'];
export const androidOsName = 'Android';
export const iphoneOsName = 'iOS';

export function isChromeBrowser(userAgent) {
  return (userAgent.browserName || '').includes('Chrome');
}

export function isUserAgentIphoneApp(userAgent = {}) {
  return (
    browserNames.includes(userAgent.browserName)
    && userAgent.osName === iphoneOsName
  );
}

export function isUserAgentAndroidApp(userAgent = {}) {
  return (
    browserNames.includes(userAgent.browserName)
    && userAgent.osName === androidOsName
  );
}

export default function isUserAgentMobileApp(userAgent) {
  return isUserAgentIphoneApp(userAgent) || isUserAgentAndroidApp(userAgent);
}

export function isUserAgentMobile(userAgent = {}) {
  return (
    userAgent.isMobile
    || userAgent.osName === iphoneOsName
    || userAgent.osName === androidOsName
    || isUserAgentMobileApp(userAgent)
  );
}
