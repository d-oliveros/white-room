const urlRegex = /^(https?:\/\/|ftp:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export function isUrl(url: string): boolean {
  return urlRegex.test(url);
}
