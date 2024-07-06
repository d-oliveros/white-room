import firstWord from '#white-room/util/firstWord.js';
import capitalize from '#white-room/util/capitalize.js';

export default function firstWordCapitalized(string) {
  return capitalize(firstWord(string));
}
