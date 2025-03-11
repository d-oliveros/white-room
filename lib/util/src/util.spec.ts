import {
  capitalize,
  capitalizeAll,
  generateRandomString,
  isUrl,
  joinUrl,
  parseJSON,
} from './index';

describe('capitalize', () => {
  test('should capitalize the first letter of a single word', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('a')).toBe('A');
  });

  test('should return the same string if the first letter is already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello');
    expect(capitalize(' a')).toBe(' A');
    expect(capitalize(' hello world ')).toBe(' Hello world ');
  });

  test('should handle non-string inputs by returning null', () => {
    expect(capitalize(123 as any)).toBeNull(); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(capitalize(null as any)).toBeNull(); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(capitalize(undefined as any)).toBeNull(); // eslint-disable-line @typescript-eslint/no-explicit-any
  });
});

describe('capitalizeAll', () => {
  test('should capitalize the first letter of each word in a string', () => {
    expect(capitalizeAll('hello world')).toBe('Hello World');
  });

  test('should handle strings with multiple spaces between words', () => {
    expect(capitalizeAll('hello   world')).toBe('Hello   World');
  });

  test('should handle strings with leading and trailing spaces', () => {
    expect(capitalizeAll('  hello world  ')).toBe('  Hello World  ');
  });

  test('should return the same string if all words are already capitalized', () => {
    expect(capitalizeAll('Hello World')).toBe('Hello World');
  });

  test('should handle empty strings', () => {
    expect(capitalizeAll('')).toBe('');
  });

  test('should handle strings with only one word', () => {
    expect(capitalizeAll('hello')).toBe('Hello');
    expect(capitalizeAll('Hello')).toBe('Hello');
    expect(capitalizeAll(' Hello  world ')).toBe(' Hello  World ');
  });

  test('should handle non-string inputs by returning them unchanged', () => {
    expect(capitalize()).toBeNull();
    expect(capitalizeAll(123 as any)).toBeNull(); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(capitalizeAll(null as any)).toBeNull(); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(capitalizeAll(undefined as any)).toBeNull(); // eslint-disable-line @typescript-eslint/no-explicit-any
  });
});

describe('generateRandomString', () => {
  test('should generate a string of the specified length', () => {
    const result = generateRandomString(10);
    expect(result.length).toBe(10);
  });

  test('should generate only alphanumeric characters', () => {
    const result = generateRandomString(20);
    expect(result).toMatch(/^[a-zA-Z0-9]+$/);
  });

  test('should generate different strings on multiple calls', () => {
    const result1 = generateRandomString(15);
    const result2 = generateRandomString(15);
    expect(result1).not.toBe(result2);
  });
});

describe('isUrl', () => {
  test('should return true for valid URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://subdomain.example.co.uk')).toBe(true);
    expect(isUrl('ftp://ftp.example.org')).toBe(true);
  });

  test('should return false for invalid URLs', () => {
    expect(isUrl('not a url')).toBe(false);
    expect(isUrl('http:/example.com')).toBe(false);
    expect(isUrl('https://')).toBe(false);
  });
});

describe('joinUrl', () => {
  test('should join URL parts correctly', () => {
    expect(joinUrl('https://example.com', 'path/to/resource')).toBe(
      'https://example.com/path/to/resource',
    );
  });

  test('should handle trailing and leading slashes', () => {
    expect(joinUrl('https://example.com/', '/path/resource/')).toBe(
      'https://example.com/path/resource',
    );
  });

  test('should handle base URL without trailing slash and path without leading slash', () => {
    expect(joinUrl('https://example.com', 'path/resource')).toBe(
      'https://example.com/path/resource',
    );
  });
});

describe('parseJSON', () => {
  test('should parse valid JSON strings', () => {
    expect(parseJSON('{"key": "value"}')).toEqual({ key: 'value' });
    expect(parseJSON('["item1", "item2"]')).toEqual(['item1', 'item2']);
  });

  test('should return false for invalid JSON strings', () => {
    expect(parseJSON('{"key": "value"')).toBe(false);
    expect(parseJSON('not json')).toBe(false);
  });

  test('should return false for non-object JSON values', () => {
    expect(parseJSON('123')).toBe(false);
    expect(parseJSON('"string"')).toBe(false);
    expect(parseJSON('true')).toBe(false);
  });
});
