import firstWord from 'common/util/firstWord';
import capitalize from 'common/util/capitalize';

export default function firstWordCapitalized(string) {
  return capitalize(firstWord(string));
}
