const transformStringToBoolean = (string) => {
  if (typeof string === 'boolean') {
    return string;
  }
  if (string === 'true') {
    return true;
  }
  if (string === 'false') {
    return false;
  }
  return null;
};

export default transformStringToBoolean;
