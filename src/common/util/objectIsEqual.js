export default function objectIsEqual(object1, object2) {
  if (
    !object1
    || !object2
    || typeof object1 !== 'object'
    || typeof object2 !== 'object'
    || Object.keys(object1).length !== Object.keys(object2).length
  ) {
    return false;
  }
  return Object.keys(object1).every((object1PropName) => {
    return object1[object1PropName] === object2[object1PropName];
  });
}
