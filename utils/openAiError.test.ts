import { describe, expect, it } from "vitest";

import {
  extractionErrorMessageForOpenAiKey,
  isOpenAiKeyFailure,
} from "./openAiError";

describe("openAiError", () => {
  it("detects OpenAI auth and quota failures", () => {
    expect(isOpenAiKeyFailure({ status: 401 })).toBe(true);
    expect(isOpenAiKeyFailure({ code: "insufficient_quota" })).toBe(true);
    expect(isOpenAiKeyFailure(new Error("Invalid API key provided."))).toBe(
      true,
    );
  });

  it("returns a settings-focused message only for custom key failures", () => {
    const error = { status: 401 };

    expect(
      extractionErrorMessageForOpenAiKey({
        error,
        keySource: "custom",
        keyLabel: "Org key",
      }),
    ).toBe(
      'Custom OpenAI key "Org key" failed. Replace or remove it in Settings.',
    );
    expect(
      extractionErrorMessageForOpenAiKey({
        error,
        keySource: "platform",
      }),
    ).toBeNull();
  });
});
