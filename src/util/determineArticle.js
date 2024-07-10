export default function determineArticle(word = '') {
  const article = /^[aeiou]/i.test(word) ? 'an' : 'a';
  return `${article} ${word}`;
}
