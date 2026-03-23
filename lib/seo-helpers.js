/**
 * ISO 8601 for schema.org date fields (Google prefers machine-readable dates).
 */
export function toIsoDateString(value) {
  if (value == null) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
