import test from "node:test";
import assert from "node:assert/strict";
import { assertSlackBlocksValid } from "./blockKitValidation.js";
import { buildTriageErrorPayload } from "./errorResponses.js";

test("buildTriageErrorPayload returns safe Block Kit error guidance", () => {
  const fakeSlackToken = `xoxb-${"secret-token-for-redaction"}`;
  const fakeOpenAiKey = `sk-${"proj-secretvalue1234567890"}`;
  const payload = buildTriageErrorPayload({
    runtimeMode: "mcp",
    error: new Error(`MCP failed with ${fakeSlackToken} and ${fakeOpenAiKey}`)
  });
  const serialized = JSON.stringify(payload);
  const result = assertSlackBlocksValid(payload.blocks);

  assert.equal(result.valid, true);
  assert.ok(serialized.includes("MCP stdio"));
  assert.ok(serialized.includes("sandbox:doctor -- --strict"));
  assert.ok(serialized.includes("smoke:slack-mcp"));
  assert.ok(!serialized.includes(fakeSlackToken));
  assert.ok(!serialized.includes(fakeOpenAiKey));
  assert.ok(serialized.includes("redacted"));
});
