import CryptoJS from 'crypto-js';

/**
 * Converts a string to MD5 hash
 * @param text - The text to be hashed
 * @returns A hexadecimal string representation of the MD5 hash
 */
export function md5Hash(text: string): string {
  return CryptoJS.MD5(text).toString();
}
