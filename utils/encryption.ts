import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const algorithm = "aes-256-gcm";
const keyBytes = 32;
const ivBytes = 12;
const authTagBytes = 16;

export type EncryptedApiKey = {
  encryptedText: string;
  iv: string;
};

function decodeMasterKey(rawKey: string) {
  const trimmed = rawKey.trim();
  const decodedAsBase64 = Buffer.from(trimmed, "base64");

  if (decodedAsBase64.length === keyBytes) {
    return decodedAsBase64;
  }

  if (/^[a-f0-9]+$/i.test(trimmed)) {
    const decodedAsHex = Buffer.from(trimmed, "hex");

    if (decodedAsHex.length === keyBytes) {
      return decodedAsHex;
    }
  }

  throw new Error("ENCRYPTION_MASTER_KEY must decode to a 32-byte key.");
}

function getMasterKey() {
  const rawKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!rawKey) {
    throw new Error("ENCRYPTION_MASTER_KEY is required for API key encryption.");
  }

  return decodeMasterKey(rawKey);
}

function splitEncryptedPayload(encryptedText: string) {
  const [ciphertext, authTag] = encryptedText.split(".");

  if (!ciphertext || !authTag) {
    throw new Error("Encrypted API key payload is malformed.");
  }

  return {
    ciphertext: Buffer.from(ciphertext, "base64url"),
    authTag: Buffer.from(authTag, "base64url"),
  };
}

export function encryptApiKey(plaintext: string): EncryptedApiKey {
  if (!plaintext) {
    throw new Error("API key plaintext is required.");
  }

  const iv = randomBytes(ivBytes);
  const cipher = createCipheriv(algorithm, getMasterKey(), iv, {
    authTagLength: authTagBytes,
  });
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedText: `${ciphertext.toString("base64url")}.${authTag.toString(
      "base64url",
    )}`,
    iv: iv.toString("base64url"),
  };
}

export function decryptApiKey(encryptedText: string, iv: string) {
  const payload = splitEncryptedPayload(encryptedText);
  const decipher = createDecipheriv(
    algorithm,
    getMasterKey(),
    Buffer.from(iv, "base64url"),
    {
      authTagLength: authTagBytes,
    },
  );

  decipher.setAuthTag(payload.authTag);

  return Buffer.concat([
    decipher.update(payload.ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
