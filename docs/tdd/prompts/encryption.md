# encryption TDD Intent

## Purpose

Verify that stored OpenAI API keys are protected with authenticated encryption
before they are persisted for BYOK.

## Cases

- Encrypt and decrypt an API key using AES-256-GCM.
- Return ciphertext and an IV without exposing plaintext.
- Produce different ciphertext and IV values on repeated encryption.
- Throw immediately when `ENCRYPTION_MASTER_KEY` is missing.
- Throw immediately when `ENCRYPTION_MASTER_KEY` is not a valid 32-byte key.
- Reject tampered ciphertext during decryption.

## Expected Red Run

The red run should fail because `utils/encryption.ts` has not been implemented.
