export default function round(_number, decimals = 2) {
  const number = parseFloat(_number);
  if (isNaN(number)) {
    return _number;
  }
  const x = 10 ** decimals;
  return Math.round((number + Number.EPSILON) * x) / x;
}
