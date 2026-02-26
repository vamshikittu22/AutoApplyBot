/**
 * Web Crypto API Encryption Wrapper
 *
 * Provides AES-256-GCM encryption for sensitive data (API keys).
 *
 * Security model:
 * - Chrome extensions are sandboxed per-extension (no cross-extension access)
 * - Static salt/passphrase acceptable because threat model is local device compromise
 * - Real security benefit: prevents accidental key exposure in logs, exports, debugging
 * - AES-256-GCM provides authenticated encryption (detects tampering)
 *
 * @see REQ-AI-02: User-provided API key support (encrypted storage)
 */

/**
 * Custom error for encryption/decryption failures
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'EncryptionError';
  }
}

// Static salt for key derivation (not secret - security comes from Chrome sandboxing)
// Generated once with: crypto.getRandomValues(new Uint8Array(16))
const SALT = new Uint8Array([
  0x4a, 0x7b, 0x9c, 0x3d, 0x8e, 0x2f, 0x1a, 0x6b, 0x5c, 0x4d, 0x9e, 0x3f, 0x2a, 0x7b, 0x8c, 0x1d,
]);

// Static passphrase (not secret - combined with salt for key derivation)
const PASSPHRASE = 'autoapply-copilot-v1-encryption-key';

// PBKDF2 iterations (OWASP recommendation)
const PBKDF2_ITERATIONS = 100_000;

/**
 * Derive encryption key from static passphrase and salt using PBKDF2
 * Returns the same key on every call (deterministic)
 */
async function deriveKey(): Promise<CryptoKey> {
  // Import passphrase as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-256-GCM key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypt plaintext string using AES-256-GCM
 *
 * @param plaintext - String to encrypt (e.g., API key)
 * @returns Base64-encoded string in format: `${iv}:${ciphertext}`
 * @throws {EncryptionError} If encryption fails
 *
 * @example
 * const encrypted = await encryptData('sk-proj-abc123...');
 * // Returns: "dGVzdGl2MTIzNDU2Nzg=:ZW5jcnlwdGVkZGF0YQ=="
 */
export async function encryptData(plaintext: string): Promise<string> {
  try {
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive encryption key
    const key = await deriveKey();

    // Convert plaintext to bytes
    const plaintextBytes = new TextEncoder().encode(plaintext);

    // Encrypt using AES-256-GCM
    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      plaintextBytes
    );

    // Convert to Uint8Array
    const ciphertext = new Uint8Array(ciphertextBuffer);

    // Encode IV and ciphertext as base64
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const ciphertextBase64 = btoa(String.fromCharCode(...ciphertext));

    // Return combined format: iv:ciphertext
    return `${ivBase64}:${ciphertextBase64}`;
  } catch (error) {
    throw new EncryptionError('Failed to encrypt data', error);
  }
}

/**
 * Decrypt ciphertext encrypted with encryptData()
 *
 * @param encrypted - Base64-encoded string in format: `${iv}:${ciphertext}`
 * @returns Original plaintext string
 * @throws {EncryptionError} If decryption fails or format is invalid
 *
 * @example
 * const decrypted = await decryptData("dGVzdGl2MTIzNDU2Nzg=:ZW5jcnlwdGVkZGF0YQ==");
 * // Returns: "sk-proj-abc123..."
 */
export async function decryptData(encrypted: string): Promise<string> {
  try {
    // Split into IV and ciphertext parts
    const parts = encrypted.split(':');
    if (parts.length !== 2) {
      throw new EncryptionError(
        'Invalid encrypted data format: missing colon separator. ' +
          'Expected format: "iv:ciphertext"'
      );
    }

    const ivBase64 = parts[0];
    const ciphertextBase64 = parts[1];

    if (!ivBase64 || !ciphertextBase64) {
      throw new EncryptionError('Invalid encrypted data format: empty IV or ciphertext');
    }

    // Decode from base64
    let iv: Uint8Array;
    let ciphertext: Uint8Array;

    try {
      const ivBytes = atob(ivBase64);
      const ciphertextBytes = atob(ciphertextBase64);

      iv = new Uint8Array(ivBytes.length);
      ciphertext = new Uint8Array(ciphertextBytes.length);

      for (let i = 0; i < ivBytes.length; i++) {
        iv[i] = ivBytes.charCodeAt(i);
      }
      for (let i = 0; i < ciphertextBytes.length; i++) {
        ciphertext[i] = ciphertextBytes.charCodeAt(i);
      }
    } catch (error) {
      throw new EncryptionError('Invalid base64 encoding in encrypted data', error);
    }

    // Derive same encryption key
    const key = await deriveKey();

    // Decrypt using AES-256-GCM
    // TypeScript type assertion needed - Uint8Array.buffer is compatible with Web Crypto API
    const plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    // Convert to string
    const plaintext = new TextDecoder().decode(plaintextBuffer);

    return plaintext;
  } catch (error) {
    if (error instanceof EncryptionError) {
      throw error;
    }
    throw new EncryptionError('Failed to decrypt data (corrupted or tampered)', error);
  }
}
