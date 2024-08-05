const withoutLeadingSlash = (str) => typeof str === 'string'
  ? str[0] === '/'
    ? str.slice(1)
    : str
  : null;

export default withoutLeadingSlash;
