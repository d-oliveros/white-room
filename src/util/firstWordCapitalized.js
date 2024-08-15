import firstWord from '#whiteroom/util/firstWord.js';
import capitalize from '#whiteroom/util/capitalize.js';

export default function firstWordCapitalized(string) {
  return capitalize(firstWord(string));
}
