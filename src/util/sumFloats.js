import round from '#whiteroom/util/round.js';

export default function sumFloats(numbers) {
  const sum = numbers.reduce((memo, number) => memo + (number * 100), 0) / 100;
  return round(sum, 2);
}
