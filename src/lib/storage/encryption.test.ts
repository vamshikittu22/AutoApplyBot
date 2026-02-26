/**
 * Encryption Wrapper Tests
 * Tests for Web Crypto API encryption/decryption functions
 */

import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, EncryptionError } from './encryption';

describe('encryptData', () => {
  it('should encrypt string and return base64-encoded result', async () => {
    const plaintext = 'sk-proj-test123';
    const encrypted = await encryptData(plaintext);

    // Should return base64:base64 format
    expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);

    // Should contain colon separator
    expect(encrypted).toContain(':');

    // Should have both IV and ciphertext parts
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBeTruthy();
    expect(parts[1]).toBeTruthy();
  });

  it('should return different ciphertext for same input (random IV)', async () => {
    const plaintext = 'sk-proj-same-input';
    const encrypted1 = await encryptData(plaintext);
    const encrypted2 = await encryptData(plaintext);

    // Different ciphertexts due to random IV
    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to same plaintext
    const decrypted1 = await decryptData(encrypted1);
    const decrypted2 = await decryptData(encrypted2);
    expect(decrypted1).toBe(plaintext);
    expect(decrypted2).toBe(plaintext);
  });

  it('should include colon separator between IV and ciphertext', async () => {
    const encrypted = await encryptData('test');
    const colonCount = (encrypted.match(/:/g) || []).length;

    // Exactly one colon separator
    expect(colonCount).toBe(1);
  });

  it('should handle empty string', async () => {
    const encrypted = await encryptData('');
    expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);

    const decrypted = await decryptData(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle unicode characters (emoji, Chinese, special chars)', async () => {
    const unicodeText = 'Hello 世界 🔐 © ñ';
    const encrypted = await encryptData(unicodeText);

    expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/);

    const decrypted = await decryptData(encrypted);
    expect(decrypted).toBe(unicodeText);
  });
});

describe('decryptData', () => {
  it('should decrypt encrypted data back to original plaintext', async () => {
    const plaintext = 'sk-ant-api03-xyz789';
    const encrypted = await encryptData(plaintext);
    const decrypted = await decryptData(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should throw EncryptionError for invalid format (no colon)', async () => {
    const invalidEncrypted = 'dGVzdGl2MTIzNDU2Nzg';

    await expect(decryptData(invalidEncrypted)).rejects.toThrow(EncryptionError);
    await expect(decryptData(invalidEncrypted)).rejects.toThrow('missing colon separator');
  });

  it('should throw EncryptionError for corrupted ciphertext', async () => {
    // Valid format but invalid base64 in ciphertext part
    const corruptedEncrypted = 'dGVzdGl2MTIz:!!!invalid-base64!!!';

    await expect(decryptData(corruptedEncrypted)).rejects.toThrow(EncryptionError);
    await expect(decryptData(corruptedEncrypted)).rejects.toThrow('Invalid base64 encoding');
  });

  it('should throw EncryptionError for wrong IV', async () => {
    const plaintext = 'test-data';
    const encrypted = await encryptData(plaintext);

    // Replace IV with different valid base64
    const parts = encrypted.split(':');
    const wrongIvEncrypted = 'AAAAAAAAAAAAAAAA:' + parts[1];

    await expect(decryptData(wrongIvEncrypted)).rejects.toThrow(EncryptionError);
  });

  it('should throw EncryptionError for empty IV or ciphertext', async () => {
    await expect(decryptData(':ciphertext')).rejects.toThrow(EncryptionError);
    await expect(decryptData('iv:')).rejects.toThrow(EncryptionError);
  });
});

describe('Round-trip tests', () => {
  it('should encrypt then decrypt to return original string', async () => {
    const testCases = [
      'simple text',
      'sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
      'Hello 世界 🔐',
      '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`',
      '   spaces   ',
      '\n\t\r',
    ];

    for (const testCase of testCases) {
      const encrypted = await encryptData(testCase);
      const decrypted = await decryptData(encrypted);
      expect(decrypted).toBe(testCase);
    }
  });

  it('should work for API key formats (sk-..., sk-ant-...)', async () => {
    const openaiKey = 'sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz0123456789';
    const anthropicKey = 'sk-ant-api03-AbCdEfGhIjKlMnOpQrStUvWxYz0123456789';

    const encryptedOpenAI = await encryptData(openaiKey);
    const encryptedAnthropic = await encryptData(anthropicKey);

    expect(await decryptData(encryptedOpenAI)).toBe(openaiKey);
    expect(await decryptData(encryptedAnthropic)).toBe(anthropicKey);
  });

  it('should work for long strings (500+ chars)', async () => {
    const longString = 'a'.repeat(500) + '世界'.repeat(50) + '🔐'.repeat(50);
    const encrypted = await encryptData(longString);
    const decrypted = await decryptData(encrypted);

    expect(decrypted).toBe(longString);
    expect(decrypted.length).toBe(longString.length);
  });
});

describe('EncryptionError', () => {
  it('should have correct name property', () => {
    const error = new EncryptionError('test message');
    expect(error.name).toBe('EncryptionError');
  });

  it('should preserve cause property', () => {
    const cause = new Error('original error');
    const error = new EncryptionError('wrapped error', cause);

    expect(error.cause).toBe(cause);
    expect(error.message).toBe('wrapped error');
  });

  it('should be instanceof Error', () => {
    const error = new EncryptionError('test');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof EncryptionError).toBe(true);
  });
});
