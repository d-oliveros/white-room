import firstWord from '#common/util/firstWord.js';
import capitalize from '#common/util/capitalize.js';

export default function firstWordCapitalized(string) {
  return capitalize(firstWord(string));
}
