const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/; // eslint-disable-line max-len

export default function isUrl(string) {
  return urlRegex.test(string);
}
