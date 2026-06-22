import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { decryptApiKey, encryptApiKey } from "./encryption";

const validMasterKey = Buffer.alloc(32, 7).toString("base64");

describe("api key encryption", () => {
  const originalMasterKey = process.env.ENCRYPTION_MASTER_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_MASTER_KEY = validMasterKey;
  });

  afterEach(() => {
    if (originalMasterKey === undefined) {
      delete process.env.ENCRYPTION_MASTER_KEY;
    } else {
      process.env.ENCRYPTION_MASTER_KEY = originalMasterKey;
    }
  });

  it("round-trips an OpenAI API key with AES-256-GCM", () => {
    const plaintext = "sk-proj-test-secret";
    const encrypted = encryptApiKey(plaintext);

    expect(encrypted.encryptedText).not.toBe(plaintext);
    expect(encrypted.iv).not.toBe(plaintext);
    expect(decryptApiKey(encrypted.encryptedText, encrypted.iv)).toBe(plaintext);
  });

  it("uses a fresh IV for every encryption", () => {
    const first = encryptApiKey("sk-proj-test-secret");
    const second = encryptApiKey("sk-proj-test-secret");

    expect(first.iv).not.toBe(second.iv);
    expect(first.encryptedText).not.toBe(second.encryptedText);
  });

  it("throws immediately when the master key is missing", () => {
    delete process.env.ENCRYPTION_MASTER_KEY;

    expect(() => encryptApiKey("sk-proj-test-secret")).toThrow(
      "ENCRYPTION_MASTER_KEY",
    );
  });

  it("throws immediately when the master key is not 32 bytes", () => {
    process.env.ENCRYPTION_MASTER_KEY = Buffer.alloc(16, 1).toString("base64");

    expect(() => encryptApiKey("sk-proj-test-secret")).toThrow(
      "32-byte",
    );
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptApiKey("sk-proj-test-secret");
    const tampered = encrypted.encryptedText.replace(/.$/, (character) =>
      character === "A" ? "B" : "A",
    );

    expect(() => decryptApiKey(tampered, encrypted.iv)).toThrow();
  });
});
