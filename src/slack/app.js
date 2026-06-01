import { App, LogLevel } from "@slack/bolt";
import { buildSlackBlocks } from "../core/incidentBrief.js";
import {
  buildChecklistPayload,
  buildCreateChannelPayload,
  buildDetectionsPayload,
  buildEvidencePayload,
  buildGuardrailsPayload,
  buildMissingBriefPayload,
  buildOwnerAckPayload,
  buildReportPayload
} from "./actionPayloads.js";
import {
  HOME_DEMO_GUIDE_ACTION,
  HOME_PROOF_CHECKLIST_ACTION,
  buildAppHomeView,
  buildHomeDemoGuideModal,
  buildHomeProofChecklistModal,
  buildSignalDeskHelp,
  buildSignalDeskProof
} from "./appHome.js";
import { createBriefStore } from "./briefStore.js";
import { resolveSignalDeskInput } from "./commandInput.js";
import { buildTriageErrorPayload } from "./errorResponses.js";
import { buildBriefForSlack } from "./triageRuntime.js";
import { createIncidentChannel, shortcutMessageText } from "./workflows.js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Check .env.example and your Slack app credentials.`);
  }
  return value;
}

const app = new App({
  token: requireEnv("SLACK_BOT_TOKEN"),
  socketMode: true,
  appToken: requireEnv("SLACK_APP_TOKEN"),
  logLevel: process.env.SLACK_LOG_LEVEL === "debug" ? LogLevel.DEBUG : LogLevel.INFO
});

const briefStore = createBriefStore();

function rememberBrief(brief) {
  briefStore.remember(brief);
}

function briefFromAction(body) {
  const id = body.actions?.[0]?.value;
  return briefStore.get(id);
}

function helpPayload() {
  return buildSignalDeskHelp({
    runtimeMode: process.env.SIGNALDESK_TRIAGE_MODE || "local"
  });
}

function proofPayload() {
  return buildSignalDeskProof({
    runtimeMode: process.env.SIGNALDESK_TRIAGE_MODE || "local"
  });
}

async function postBrief({ text, reporter, channel, respond, say }) {
  let payload;

  try {
    const brief = await buildBriefForSlack({
      alertText: text,
      reporter,
      channel
    });
    rememberBrief(brief);
    payload = {
      text: brief.summary,
      blocks: buildSlackBlocks(brief)
    };
  } catch (error) {
    payload = buildTriageErrorPayload({
      error,
      runtimeMode: process.env.SIGNALDESK_TRIAGE_MODE || "local"
    });

    if (respond) {
      await respond({ response_type: "ephemeral", ...payload });
      return;
    }

    await say(payload);
    return;
  }

  if (respond) {
    await respond({ response_type: "in_channel", ...payload });
    return;
  }

  await say(payload);
}

app.command("/signaldesk", async ({ command, ack, respond }) => {
  await ack();

  const input = resolveSignalDeskInput(command.text);
  if (input.type === "help") {
    await respond({
      response_type: "ephemeral",
      ...helpPayload()
    });
    return;
  }
  if (input.type === "proof") {
    await respond({
      response_type: "ephemeral",
      ...proofPayload()
    });
    return;
  }

  await postBrief({
    text: input.alertText,
    reporter: command.user_name || command.user_id,
    channel: command.channel_name || command.channel_id,
    respond
  });
});

app.shortcut({ callback_id: "signaldesk_triage_message", type: "message_action" }, async ({ shortcut, ack, respond }) => {
  await ack();

  const text = shortcutMessageText(shortcut);
  if (!text) {
    await respond({
      response_type: "ephemeral",
      text: "SignalDesk could not extract readable text from that message."
    });
    return;
  }

  await postBrief({
    text,
    reporter: shortcut.user?.username || shortcut.user?.id || "message-shortcut",
    channel: shortcut.channel?.name || shortcut.channel?.id || "message-shortcut",
    respond
  });
});

app.event("app_mention", async ({ event, say }) => {
  const input = resolveSignalDeskInput(event.text?.replace(/<@[^>]+>/g, ""));
  if (input.type === "help") {
    await say(helpPayload());
    return;
  }
  if (input.type === "proof") {
    await say(proofPayload());
    return;
  }

  await postBrief({
    text: input.alertText,
    reporter: event.user,
    channel: event.channel,
    say
  });
});

app.event("app_home_opened", async ({ event, client, logger }) => {
  if (event.tab && event.tab !== "home") return;

  try {
    await client.views.publish({
      user_id: event.user,
      view: buildAppHomeView({
        runtimeMode: process.env.SIGNALDESK_TRIAGE_MODE || "local"
      })
    });
  } catch (error) {
    logger.error(error);
  }
});

async function openHomeModal({ body, client, logger, view }) {
  if (!body.trigger_id) {
    logger.warn("SignalDesk App Home action did not include trigger_id.");
    return;
  }

  try {
    await client.views.open({
      trigger_id: body.trigger_id,
      view
    });
  } catch (error) {
    logger.error(error);
  }
}

app.action(HOME_DEMO_GUIDE_ACTION, async ({ ack, body, client, logger }) => {
  await ack();
  await openHomeModal({
    body,
    client,
    logger,
    view: buildHomeDemoGuideModal({
      runtimeMode: process.env.SIGNALDESK_TRIAGE_MODE || "local"
    })
  });
});

app.action(HOME_PROOF_CHECKLIST_ACTION, async ({ ack, body, client, logger }) => {
  await ack();
  await openHomeModal({
    body,
    client,
    logger,
    view: buildHomeProofChecklistModal({
      runtimeMode: process.env.SIGNALDESK_TRIAGE_MODE || "local"
    })
  });
});

app.action("signaldesk_ack_owner", async ({ ack, body, respond }) => {
  await ack();
  const user = body.user?.name || body.user?.id || "A responder";
  const brief = briefFromAction(body);
  await respond(buildOwnerAckPayload({ brief, user }));
});

app.action("signaldesk_create_channel", async ({ ack, body, client, respond }) => {
  await ack();
  const brief = briefFromAction(body);

  if (!brief) {
    await respond(buildMissingBriefPayload("Incident details"));
    return;
  }

  const result = await createIncidentChannel({ brief, client });
  await respond(buildCreateChannelPayload(result));
});

app.action("signaldesk_show_checklist", async ({ ack, body, respond }) => {
  await ack();
  const brief = briefFromAction(body);
  await respond(buildChecklistPayload(brief));
});

app.action("signaldesk_show_evidence", async ({ ack, body, respond }) => {
  await ack();
  const brief = briefFromAction(body);
  await respond(buildEvidencePayload(brief));
});

app.action("signaldesk_show_guardrails", async ({ ack, body, respond }) => {
  await ack();
  const brief = briefFromAction(body);
  await respond(buildGuardrailsPayload(brief));
});

app.action("signaldesk_show_detections", async ({ ack, body, respond }) => {
  await ack();
  const brief = briefFromAction(body);
  await respond(buildDetectionsPayload(brief));
});

app.action("signaldesk_export_report", async ({ ack, body, respond }) => {
  await ack();
  const brief = briefFromAction(body);
  await respond(buildReportPayload(brief));
});

app.error(async (error) => {
  app.logger.error(error);
});

const port = Number(process.env.PORT || 3000);
await app.start(port);
app.logger.info(`SignalDesk Slack app started on port ${port}`);
