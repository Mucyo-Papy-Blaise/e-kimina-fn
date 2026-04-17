/**
 * Encodes a string to base64url format (URL-safe base64)
 * Works in both browser and Node.js environments
 */
export function base64UrlEncode(str: string): string {
  if (typeof window === 'undefined') {
    // Node.js environment
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  // Browser environment
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decodes a base64url string to plain text
 * Works in both browser and Node.js environments
 */
export function base64UrlDecode(str: string): string {
  // Convert base64url to standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }

  if (typeof window === 'undefined') {
    // Node.js environment
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
  // Browser environment
  return atob(base64);
}
