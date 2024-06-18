export default function withFieldNamePrefix(prefix) {
  return (fieldName) => `${prefix}.${fieldName} as ${fieldName}`;
}
