const removeEmpty = (obj) => {
  if (Array.isArray(obj)) {
    return obj
      .map((value) => (typeof value === 'object' ? removeEmpty(value) : value))
      .filter((value) => {
        return (
          value !== null
          && value !== undefined
          && !(typeof value === 'object' && Object.keys(value).length === 0)
        );
      });
  }
  else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          const cleanedValue = removeEmpty(value);
          if (Object.keys(cleanedValue).length !== 0 || Array.isArray(cleanedValue)) {
            acc[key] = cleanedValue;
          }
        }
        else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
  }
  else {
    return obj;
  }
};

export default removeEmpty;
