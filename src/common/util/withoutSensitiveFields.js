const sensitiveKeywords = [
  'password',
];

export default function withoutSensitiveFields(object) {
  if (typeof object !== 'object' || !object) {
    return object;
  }
  const newObject = {};
  for (const key of Object.keys(object)) {
    newObject[key] = sensitiveKeywords.includes(key.toLowerCase())
      ? '*PRIVATE*'
      : object[key];
  }
  return newObject;
}
