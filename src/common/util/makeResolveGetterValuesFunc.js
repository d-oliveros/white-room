export default function makeResolveGetterValuesFunc(resolverFuncArgs) {
  return (objectToResolve) => {
    return Object.keys(objectToResolve).reduce((memo, key) => ({
      ...memo,
      [key]: typeof objectToResolve[key] === 'function'
        ? objectToResolve[key](resolverFuncArgs)
        : objectToResolve[key],
    }), {});
  };
}
