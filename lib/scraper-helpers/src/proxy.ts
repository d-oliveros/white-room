export interface ProxyMetadata {
  username: string;
  password: string;
  hostname: string;
  protocol: string;
  port: string;
}

export const getProxyMetadata = (url: string): ProxyMetadata => {
  if (url.includes('RANDOM(1-49999)')) {
    const randomPort = Math.floor(Math.random() * 49999) + 1;
    url = url.replace('RANDOM(1-49999)', randomPort.toString());
  }

  const rangeMatch = url.match(/{{FROM:(\d+)\|TO:(\d+)}}/);
  if (rangeMatch) {
    const proxyRangePort = generateProxyRangePort(url);
    url = url.replace(rangeMatch[0], proxyRangePort);
  }

  const { hostname, password, port, protocol, username } = new URL(url);
  return {
    username: decodeURIComponent(username),
    password: decodeURIComponent(password),
    hostname,
    protocol: protocol.slice(0, -1),
    port,
  };
};

/**
 * Detects and logs the current IP address being used by a Playwright page
 * Useful for verifying proxy configurations are working correctly
 * @param page - Playwright Page object
 * @returns The detected IP address or undefined if detection failed
 */
export async function detectCurrentIp(page: {
  goto: (url: string) => Promise<unknown>;
  content: () => Promise<string>;
}): Promise<string | undefined> {
  try {
    await page.goto('https://api.ipify.org?format=json');
    const ipContent = await page.content();
    const ipMatch = ipContent.match(/"ip":"([^"]+)"/);
    const currentIp = ipMatch ? ipMatch[1] : undefined;
    return currentIp;
  } catch (e) {
    return undefined;
  }
}

/**
 * Generates a random number within a range and formats it to match the original format.
 * Preserves leading zeros from the original strings.
 *
 * @param fromStr The lower bound of the range as a string (e.g., "0422053474")
 * @param toStr The upper bound of the range as a string (e.g., "0422083473")
 * @returns A string representing a random number within the range, preserving format
 */
export function generateRandomNumberInRange(fromStr: string, toStr: string): string {
  // Parse the range values
  const from = parseInt(fromStr, 10);
  const to = parseInt(toStr, 10);

  if (isNaN(from) || isNaN(to)) {
    throw new Error(`Invalid range values: from=${fromStr}, to=${toStr}`);
  }

  // Generate a random number within the range (inclusive)
  const randomNum = Math.floor(Math.random() * (to - from + 1)) + from;

  // Determine the format (number of digits) from the original values
  const digits = Math.max(fromStr.length, toStr.length);

  // Format the random number with leading zeros if needed
  return randomNum.toString().padStart(digits, '0');
}

/**
 * Parses a range pattern in the format {{FROM:x|TO:y}} and returns a random value within that range.
 *
 * @param rangePattern A string in the format {{FROM:x|TO:y}}
 * @returns A string representing a random number within the specified range
 */
export function generateProxyRangePort(rangePattern: string): string {
  const match = rangePattern.match(/{{FROM:(\d+)\|TO:(\d+)}}/);

  if (!match) {
    throw new Error(`Invalid range pattern: ${rangePattern}`);
  }

  const [, fromStr, toStr] = match;
  return generateRandomNumberInRange(fromStr, toStr);
}
