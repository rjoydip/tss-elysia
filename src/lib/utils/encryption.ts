import { env } from "~/config/env";
import { logger } from "~/lib/logger";

/**
 * Password encryption utilities for client-side encoding and server-side decoding.
 * Provides AES-GCM encryption to prevent plain-text passwords
 * from being visible in network logs and browser dev tools.
 */

// Key derivation from the environment secret
async function getEncryptionKey(secret: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("static-salt-for-obfuscation"),
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encodes a string using AES-GCM on the client side.
 *
 * @param str - The string to encode
 * @returns Encrypted string in format: iv.data (hex)
 */
export async function encodePassword(str: string): Promise<string> {
  if (!str) return str;
  try {
    const secret = (env as any).VITE_PASS_ENCRYPTION_KEY || "default-pass-key-replace-me-in-prod";
    const key = await getEncryptionKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(str);

    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

    const encryptedArray = new Uint8Array(encrypted);
    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const dataHex = Array.from(encryptedArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${ivHex}.${dataHex}`;
  } catch (e) {
    logger.error(`Encryption failed: ${e}`);
    return str; // Fallback to plain text if encryption fails
  }
}

/**
 * Decodes an AES-GCM encrypted string.
 *
 * @param str - The encrypted string to decode
 * @returns Decoded plain-text string
 */
export async function decodePassword(str: string): Promise<string> {
  if (!str || !str.includes(".")) return str;
  try {
    const [ivHex, dataHex] = str.split(".");
    if (!ivHex || !dataHex) return str;

    const secret = (env as any).VITE_PASS_ENCRYPTION_KEY || "default-pass-key-replace-me-in-prod";
    const key = await getEncryptionKey(secret);

    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const encryptedData = new Uint8Array(
      dataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (e) {
    // If decoding fails, return original string (might not be encoded or different key)
    logger.error(`Encryption failed: ${e}`);
    return str;
  }
}