import typeCheckModule from 'type-check';
import dayjs from 'dayjs';
import ipRegex from 'ip-regex';
import isUrl from '#common/util/isUrl.js';
import extractDateParts from '#common/util/extractDateParts.js';

const allNumbersRegex = /^\d+$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line

const typeCheckCustomTypes = {
  NonEmptyObject: {
    typeOf: 'Object',
    validate: (x) => Object.keys(x).length,
  },
  NonEmptyArray: {
    typeOf: 'Array',
    validate: (x) => x.length > 0,
  },
  NonEmptyString: {
    typeOf: 'String',
    validate: (x) => !!x,
  },
  PositiveNumber: {
    typeOf: 'Number',
    validate: (x) => x > 0,
  },
  NonNegativeNumber: {
    typeOf: 'Number',
    validate: (x) => x >= 0,
  },
  DateString: {
    typeOf: 'String',
    validate: (x) => x && dayjs(x).isValid(),
  },
  DayString: {
    typeOf: 'String',
    validate: (x) => x && extractDateParts(x),
  },
  Phone: {
    typeOf: 'String',
    validate: (x) => x && x.length === 10 && allNumbersRegex.test(x),
  },
  Email: {
    typeOf: 'String',
    validate: (x) => x && emailRegex.test(x),
  },
  Dayjs: {
    typeOf: 'Object',
    validate: (x) => dayjs.isDayjs(x) && x.isValid(),
  },
  FileObject: {
    typeOf: 'Object',
    validate: (x) => (
      x
      && x.fileBlobUrl
      && typeof x.fileBlobUrl === 'string'
      && x.uploadTime
      && typeof x.uploadTime === 'number'
      && x.name
      && typeof x.name === 'string'
      && x.size
      && typeof x.size === 'number'
      && x.type
      && typeof x.type === 'string'
    ),
  },
  Point: {
    typeOf: 'Array',
    validate: (x) => (
      x
      && x.length === 2
      && typeof x[0] === 'number'
      && typeof x[1] === 'number'
    ),
  },
  Url: {
    typeOf: 'String',
    validate: isUrl,
  },
  IpAddress: {
    typeOf: 'String',
    validate: (x) => (
      x
      && ipRegex({ exact: true }).test(x)
    ),
  },
  GeoJson: {
    typeOf: 'Object',
    validate: (x) => {
      if (!x || typeof x !== 'object') {
        return false;
      }

      const validGeoJsonTypes = [
        'Point',
        'MultiPoint',
        'LineString',
        'MultiLineString',
        'Polygon',
        'MultiPolygon',
        'GeometryCollection',
        'Feature',
        'FeatureCollection',
      ];

      if (!validGeoJsonTypes.includes(x.type)) {
        return false;
      }

      // Basic validation for coordinates depending on the GeoJSON type
      switch (x.type) {
        case 'Point':
          return (
            Array.isArray(x.coordinates)
            && x.coordinates.length === 2
            && x.coordinates.every((coord) => typeof coord === 'number')
          );
        case 'MultiPoint':
        case 'LineString':
          return (
            Array.isArray(x.coordinates)
            && x.coordinates.every((point) => Array.isArray(point)
              && point.length === 2
              && point.every((coord) => typeof coord === 'number')
            )
          );
        case 'MultiLineString':
        case 'Polygon':
          return (
            Array.isArray(x.coordinates)
            && x.coordinates.every((line) => Array.isArray(line)
              && line.every((point) => Array.isArray(point)
                && point.length === 2
                && point.every((coord) => typeof coord === 'number')
              )
            )
          );
        case 'MultiPolygon':
          return (
            Array.isArray(x.coordinates)
            && x.coordinates.every((polygon) => Array.isArray(polygon)
              && polygon.every((line) => Array.isArray(line)
              && line.every((point) => Array.isArray(point)
                && point.length === 2
                && point.every((coord) => typeof coord === 'number'))
              )
            )
          );
        case 'GeometryCollection':
          return (
            Array.isArray(x.geometries)
            && x.geometries.every((geometry) => typeCheckCustomTypes.GeoJson.validate(geometry))
          );
        case 'Feature':
          return (
            typeof x.geometry === 'object'
            && typeCheckCustomTypes.GeoJson.validate(x.geometry)
          );
        case 'FeatureCollection':
          return (
            Array.isArray(x.features)
            && x.features.every((feature) => typeof feature === 'object'
              && typeCheckCustomTypes.GeoJson.validate(feature)
            )
          );
        default:
          return false;
      }
    },
  },
  GeoJsonMultiPolygon: {
    typeOf: 'Object',
    validate: (x) => {
      if (!x || typeof x !== 'object' || x.type !== 'MultiPolygon') {
        return false;
      }
      return typeCheckCustomTypes.GeoJson.validate(x);
    },
  },
  GeoJsonFeatureCollection: {
    typeOf: 'Object',
    validate: (x) => {
      if (!x || typeof x !== 'object' || x.type !== 'FeatureCollection' || !Array.isArray(x.features)) {
        return false;
      }
      return typeCheckCustomTypes.GeoJson.validate(x);
    },
  },
};

function toDisplayString(actual) {
  return (
    typeof actual === 'function'
      ? '(function `' + (actual.name || '(anonymous)') + '`)'
      : (
        typeof actual === 'string'
          ? (!String(actual) ? '(empty string)' : '(string `' + String(actual) + '`)')
          : (
            Array.isArray(actual)
              ? (!(actual.length > 0) ? '(empty array)' : '(array `' + String(actual) + '`)')
              : (
                typeof actual === 'number'
                  ? '(number `' + String(actual) + '`)'
                  : (
                    actual === null
                      ? '(null)'
                      : (
                        actual === undefined
                          ? '(undefined)'
                          : (
                            typeof actual === 'object'
                              ? '(object `' + Object.prototype.toString.apply(actual) + '`)'
                              : String(actual)
                          )
                      )
                  )
              )
          )
      )
  );
}

export default function typeCheck(annotatedTypeName, toCheck, options = {}) {
  const isValid = typeCheckModule.typeCheck(annotatedTypeName, toCheck, {
    ...options,
    customTypes: {
      ...(options.customTypes || {}),
      ...typeCheckCustomTypes,
    },
  });
  if (!isValid) {
    const varName = annotatedTypeName.includes('::') ? annotatedTypeName.split('::')[0].trim() : null;
    const typeName = annotatedTypeName.split('::').slice(-1)[0].trim();

    const error = new Error(options.errorMessage ||
      `Expected${varName ? ' `' + varName + '`' : ''} to be ${typeName}, ` +
      `got: ${toDisplayString(toCheck)}`
    );
    error.name = 'TypeCheckAssertError';
    error.details = {
      varName,
      typeName,
      annotatedTypeName,
      toCheck,
    };
    throw error;
  }
}
