export default function trimStringValues(obj) {
  if (typeof obj === 'string') {
    return obj.trim();
  }
  if (typeof obj !== 'object' || !obj) {
    return obj;
  }
  if (Array.isArray(obj)) {
    const newArr = [];
    for (const item of obj) {
      newArr.push(trimStringValues(item));
    }
    return newArr;
  }

  const newObj = {};
  for (const key of Object.keys(obj)) {
    newObj[key] = trimStringValues(obj[key]);
  }

  return newObj;
}
