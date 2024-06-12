import objectDiffModule from 'objectdiff';

function sanitizeDiff(diff) {
  if (!diff || diff.changed === 'equal') return diff;

  const value = diff.value;

  if (typeof value === 'object' && value) {
    Object.keys(value).forEach((key) => {
      if (value[key]) {
        if (value[key].changed === 'equal') {
          delete value[key];
        }
        else if (typeof value[key].value === 'object' && value[key].value) {
          sanitizeDiff(value[key]);
          if (value[key].changed === 'object change') {
            value[key] = value[key].value;
          }
        }
      }
    });
  }

  return diff;
}

export default function objectDiff(obj1, obj2) {
  return sanitizeDiff(objectDiffModule.diff(obj1, obj2));
}
