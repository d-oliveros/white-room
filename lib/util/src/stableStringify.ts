/**
 * Converts a value to a stable JSON string representation.
 *
 * This function creates a deterministic string representation of any JSON-serializable value,
 * ensuring that equivalent objects produce identical strings regardless of property order.
 * It achieves this by:
 *
 * 1. For arrays: Preserving array order and stringifying each element
 * 2. For objects: Sorting keys alphabetically before stringifying
 * 3. For primitives: Using standard JSON.stringify
 *
 * This is useful for:
 * - Generating consistent hashes of objects
 * - Comparing objects for deep equality
 * - Caching object representations
 *
 * @param obj - Any JSON-serializable value (object, array, string, number, boolean, or null)
 * @returns A stable string representation of the input
 */

export function stableStringify(obj: unknown): string {
  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(',')}]`;
  } else if (obj !== null && typeof obj === 'object') {
    const sortedKeys = Object.keys(obj).sort();
    return `{${sortedKeys.map((key) => `"${key}":${stableStringify(obj[key as keyof typeof obj])}`).join(',')}}`;
  } else {
    return JSON.stringify(obj);
  }
}
