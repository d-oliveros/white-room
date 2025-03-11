export function withoutLeadingSlash(pathString: string): string {
  return pathString[0] === '/' ? pathString.slice(1) : pathString;
}
