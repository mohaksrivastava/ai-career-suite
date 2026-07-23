// RULE S-7: strips control characters and enforces a 50,000-character ceiling.
const MAX_FIELD_LENGTH = 50_000;
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeInput(str) {
  if (typeof str !== 'string') throw new TypeError('Input must be a string');
  if (str.length > MAX_FIELD_LENGTH) {
    throw new RangeError(`Input exceeds maximum length of ${MAX_FIELD_LENGTH} characters`);
  }
  return str.replace(CONTROL_CHAR_RE, '');
}
