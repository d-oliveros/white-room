import geoip from 'geoip-lite';
import inspect from 'util-inspect';

const debug = __log.debug('whiteroom:modules:geolocation');

export function getIPLocation(ip) {
  if (!ip) return null;

  const location = geoip.lookup(ip);
  if (!location) return null;

  location.ll.reverse();

  debug(`Resolved IP ${ip} - ${inspect(location)}`);

  return location;
}

export function getRequestIP(req) {
  let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

  if (!ip || ip.indexOf('127.0.0.1') > -1) {
    if (__config.env === 'production') return null;
    ip = '199.16.156.21'; // Fake a californian IP, if we're running in local
  }

  return ip;
}

export function getRequestLocation(req) {
  const ip = getRequestIP(req);
  return getIPLocation(ip);
}
