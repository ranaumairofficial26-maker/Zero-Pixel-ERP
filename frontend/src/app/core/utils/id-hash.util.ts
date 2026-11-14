const SALT_PRIME = 7919;
const XOR_MASK = 0x5A3C9E21;
const PREFIX = 'zp_';

/**
 * Encodes a numeric database ID into an opaque URL-safe hash token
 * so raw sequential IDs are not exposed directly in browser URLs.
 */
export function encodeRouteId(id: number): string {
  if (!Number.isFinite(id) || id <= 0) {
    return String(id);
  }
  const obfuscated = ((id * SALT_PRIME) ^ XOR_MASK) >>> 0;
  const check = ((id * 31 + 17) % 1296).toString(36).padStart(2, '0');
  return `${PREFIX}${obfuscated.toString(36)}${check}`;
}

/**
 * Decodes an opaque route hash token back to the numeric database ID.
 * Also accepts plain numeric IDs for backwards compatibility.
 */
export function decodeRouteId(param: string | null | undefined): number | null {
  if (!param) return null;
  const trimmed = param.trim();

  if (/^\d+$/.test(trimmed)) {
    const plain = Number(trimmed);
    return Number.isSafeInteger(plain) && plain > 0 ? plain : null;
  }

  if (!trimmed.startsWith(PREFIX) || trimmed.length < PREFIX.length + 3) {
    return null;
  }

  const body = trimmed.slice(PREFIX.length);
  const encodedVal = body.slice(0, -2);
  const check = body.slice(-2);

  const obfuscated = parseInt(encodedVal, 36);
  if (Number.isNaN(obfuscated)) return null;

  const raw = (obfuscated ^ XOR_MASK) >>> 0;
  if (raw % SALT_PRIME !== 0) return null;

  const id = raw / SALT_PRIME;
  const expectedCheck = ((id * 31 + 17) % 1296).toString(36).padStart(2, '0');
  return check === expectedCheck && id > 0 ? id : null;
}
