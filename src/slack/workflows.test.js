import test from "node:test";
import assert from "node:assert/strict";
import { buildIncidentBrief } from "../core/incidentBrief.js";
import { channelNameCandidate, createIncidentChannel, incidentKickoffBlocks, shortcutMessageText } from "./workflows.js";

const brief = buildIncidentBrief({
  alertText: "Volunteer clicked https://donor-login.example.bad/reset from 198.51.100.23 and pasted an access token.",
  reporter: "max",
  channel: "security-help",
  timestamp: "2026-06-01T12:00:00.000Z"
});

test("shortcutMessageText extracts text from message, attachments, and blocks", () => {
  const text = shortcutMessageText({
    message: {
      text: "primary alert",
      attachments: [{ text: "attachment text" }],
      blocks: [
        { text: { text: "block text" } },
        { fields: [{ text: "field text" }] }
      ]
    }
  });

  assert.equal(text, "primary alert\nattachment text\nblock text\nfield text");
});

test("channelNameCandidate returns Slack-safe channel names", () => {
  const unsafeBrief = {
    slackPlan: {
      suggestedChannelName: "INC Token Exposure! With Spaces And !!!"
    }
  };

  assert.equal(channelNameCandidate(unsafeBrief), "inc-token-exposure-with-spaces-and");
  assert.equal(channelNameCandidate(unsafeBrief, "abc123"), "inc-token-exposure-with-spaces-and-abc123");
});

test("incidentKickoffBlocks returns valid Slack blocks", () => {
  const blocks = incidentKickoffBlocks(brief);

  assert.equal(blocks[0].type, "header");
  assert.ok(JSON.stringify(blocks).includes("Validate impact with logs"));
});

test("createIncidentChannel posts kickoff message on first successful create", async () => {
  const calls = [];
  const client = {
    conversations: {
      create: async (payload) => {
        calls.push(["create", payload]);
        return { channel: { id: "C123", name: payload.name } };
      }
    },
    chat: {
      postMessage: async (payload) => {
        calls.push(["postMessage", payload]);
        return { ok: true };
      }
    }
  };

  const result = await createIncidentChannel({ brief, client, suffix: "retry" });

  assert.deepEqual(result, { ok: true, channelId: "C123", channelName: "inc-token-exposure" });
  assert.equal(calls[0][0], "create");
  assert.equal(calls[1][0], "postMessage");
  assert.equal(calls[1][1].channel, "C123");
});

test("createIncidentChannel retries when the channel name is taken", async () => {
  const creates = [];
  const client = {
    conversations: {
      create: async (payload) => {
        creates.push(payload.name);
        if (creates.length === 1) {
          const error = new Error("name_taken");
          error.data = { error: "name_taken" };
          throw error;
        }
        return { channel: { id: "C999", name: payload.name } };
      }
    },
    chat: {
      postMessage: async () => ({ ok: true })
    }
  };

  const result = await createIncidentChannel({ brief, client, suffix: "retry" });

  assert.equal(result.ok, true);
  assert.equal(result.channelName, "inc-token-exposure-retry");
  assert.deepEqual(creates, ["inc-token-exposure", "inc-token-exposure-retry"]);
});

test("createIncidentChannel returns missing scope errors without posting", async () => {
  let posted = false;
  const client = {
    conversations: {
      create: async () => {
        const error = new Error("missing_scope");
        error.data = { error: "missing_scope" };
        throw error;
      }
    },
    chat: {
      postMessage: async () => {
        posted = true;
      }
    }
  };

  const result = await createIncidentChannel({ brief, client });

  assert.deepEqual(result, { ok: false, error: "missing_scope" });
  assert.equal(posted, false);
});
