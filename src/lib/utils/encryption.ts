/**
 * Password encryption utilities for client-side encoding and server-side decoding.
 * Provides a simple Base64-based obfuscation layer to prevent plain-text passwords
 * from being visible in network logs and browser dev tools.
 */

/**
 * Encodes a string to Base64 on the client side.
 * Uses the browser-native btoa() function.
 *
 * @param str - The string to encode
 * @returns Base64 encoded string
 */
export function encodePassword(str: string): string {
  if (!str) return str;
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64");
  }
  return btoa(str);
}

/**
 * Decodes a Base64 string.
 * Handles both browser and server-side (Node/Bun) environments.
 *
 * @param str - The Base64 string to decode
 * @returns Decoded plain-text string
 */
export function decodePassword(str: string): string {
  if (!str) return str;
  try {
    if (typeof window === "undefined") {
      return Buffer.from(str, "base64").toString("utf-8");
    }
    return atob(str);
  } catch (e) {
    // If decoding fails, return original string (might not be encoded)
    return str;
  }
}
