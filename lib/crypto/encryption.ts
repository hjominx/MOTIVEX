/**
 * Server-side only. Never import this in client components.
 *
 * Algorithm: AES-256-GCM
 *   - 256-bit key derived from ENCRYPTION_KEY env var
 *   - Random 12-byte IV per encryption
 *   - 16-byte auth tag (GCM provides authenticated encryption)
 *
 * Stored format (base64-encoded, colon-delimited):
 *   <iv_hex>:<authTag_hex>:<ciphertext_hex>
 *
 * Why GCM over CBC:
 *   - Built-in integrity check (auth tag) — detects tampering
 *   - No padding oracle vulnerability
 *   - Single pass (faster)
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;      // 96-bit IV recommended for GCM
const TAG_LENGTH = 10;     // 128-bit auth tag

/**
 * Derive a fixed 32-byte key from the ENCRYPTION_KEY env var.
 * Using SHA-256 so any string length works as the env var.
 */
function getDerivedKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length < 32) {
    throw new Error(
      '[encryption] ENCRYPTION_KEY is missing or too short. ' +
      'Set a random 64-char hex string in your environment variables.'
    );
  }
  // SHA-256 of the raw key → always 32 bytes regardless of input length
  return createHash('sha256').update(raw).digest();
}

/**
 * Encrypt a plaintext string.
 * Returns a single storable string: `<iv>:<authTag>:<ciphertext>` (all hex).
 */
export function encrypt(plaintext: string): string {
  const key = getDerivedKey();
  const iv  = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

/**
 * Decrypt a string produced by `encrypt()`.
 * Throws if the auth tag doesn't match (data was tampered with).
 */
export function decrypt(stored: string): string {
  const parts = stored.split(':');
  if (parts.length !== 3) {
    throw new Error('[encryption] Invalid encrypted format.');
  }

  const [ivHex, tagHex, ciphertextHex] = parts;
  const key        = getDerivedKey();
  const iv         = Buffer.from(ivHex, 'hex');
  const authTag    = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    // GCM auth tag mismatch → data integrity violation
    throw new Error('[encryption] Decryption failed: auth tag mismatch. Data may be corrupted or tampered.');
  }
}

/**
 * Convenience: encrypt only if value is non-empty, otherwise return null.
 */
export function encryptOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  return encrypt(value);
}

/**
 * Convenience: decrypt only if value is non-null, otherwise return null.
 */
export function decryptOrNull(stored: string | null | undefined): string | null {
  if (!stored) return null;
  return decrypt(stored);
}
