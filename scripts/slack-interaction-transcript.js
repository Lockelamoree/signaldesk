import { mkdirSync, writeFileSync } from "node:fs";
import { buildSlackBlocks } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";
import { assertSlackBlocksValid } from "../src/slack/blockKitValidation.js";
import { createBriefStore } from "../src/slack/briefStore.js";
import {
  buildChecklistPayload,
  buildCreateChannelPayload,
  buildDetectionsPayload,
  buildEvidencePayload,
  buildGuardrailsPayload,
  buildOwnerAckPayload,
  buildReportPayload
} from "../src/slack/actionPayloads.js";
import { buildBriefForSlack } from "../src/slack/triageRuntime.js";
import { createIncidentChannel } from "../src/slack/workflows.js";

const outDir = "artifacts/submission";
const generatedAt = new Date().toISOString();

function excerpt(text, length = 260) {
  const compact = String(text).replace(/\s+/g, " ").trim();
  return compact.length > length ? `${compact.slice(0, length - 3)}...` : compact;
}

function assertIncludes(label, text, terms) {
  const missing = terms.filter((term) => !String(text).includes(term));
  if (missing.length) {
    throw new Error(`${label} missing expected term(s): ${missing.join(", ")}`);
  }
}

function responseRow(label, payload, expectedTerms) {
  assertIncludes(label, payload.text, expectedTerms);
  return {
    label,
    responseType: payload.response_type,
    textLength: payload.text.length,
    expectedTerms,
    excerpt: excerpt(payload.text)
  };
}

const brief = await buildBriefForSlack({
  alertText: sampleIncidents[0].alertText,
  reporter: "interaction-transcript",
  channel: "security-help",
  mode: "mcp"
});

const blockValidation = assertSlackBlocksValid(buildSlackBlocks(brief));
const clientCalls = [];
const fakeClient = {
  conversations: {
    create: async (payload) => {
      clientCalls.push({ method: "conversations.create", payload });
      return { channel: { id: "CINTERACTION", name: payload.name } };
    }
  },
  chat: {
    postMessage: async (payload) => {
      clientCalls.push({ method: "chat.postMessage", payload: { ...payload, blocks: `${payload.blocks?.length ?? 0} block(s)` } });
      return { ok: true };
    }
  }
};
const channelResult = await createIncidentChannel({ brief, client: fakeClient, suffix: "judge" });

if (!channelResult.ok) {
  throw new Error(`Expected fake channel creation to succeed, got ${channelResult.error}`);
}

const recoveryDirectory = "artifacts/private/brief-store-proof";
const recoveryWriter = createBriefStore({ persist: true, directory: recoveryDirectory, maxEntries: 5 });
const recoveryReader = createBriefStore({ persist: true, directory: recoveryDirectory, maxEntries: 5 });
if (!recoveryWriter.remember(brief)) {
  throw new Error("Expected synthetic brief persistence to succeed");
}
const recoveredBrief = recoveryReader.get(brief.id);
if (recoveredBrief?.summary !== brief.summary) {
  throw new Error("Expected synthetic brief persistence recovery to match the original brief");
}

const rows = [
  {
    label: "Initial incident brief",
    responseType: "in_channel",
    textLength: brief.summary.length,
    expectedTerms: ["MCP stdio", "evidence IDs", "detection checks"],
    excerpt: `${blockValidation.summary.blocks} Block Kit blocks, ${blockValidation.summary.interactiveElements} interactive elements, runtime ${brief.runtime.mode} via ${brief.runtime.tool}.`
  },
  responseRow("Take owner", buildOwnerAckPayload({ brief, user: "Max" }), ["took incident ownership", "preserve evidence"]),
  responseRow("Create channel", buildCreateChannelPayload(channelResult), ["created #", "incident kickoff"]),
  responseRow("Show checklist", buildChecklistPayload(brief), ["SignalDesk evidence checklist", "Identity provider sign-in logs"]),
  responseRow("Evidence", buildEvidencePayload(brief), ["SignalDesk evidence ledger", "Claim audit", "EV-001"]),
  responseRow("Detections", buildDetectionsPayload(brief), ["SignalDesk detection plan", "DET-001", "Evidence:"]),
  responseRow("Report", buildReportPayload(brief), ["SignalDesk Incident Report", "First-Response Readiness"]),
  responseRow("Guardrails", buildGuardrailsPayload(brief), ["SignalDesk guardrails", "Confirm impact with logs"])
];

const proof = {
  generatedAt,
  runtime: brief.runtime,
  scenario: brief.scenario,
  severity: brief.severity,
  blockValidation: blockValidation.summary,
  briefRecovery: {
    ok: true,
    directory: recoveryDirectory,
    evidenceBoundary: "Private synthetic demo recovery only; do not persist real Slack incident data."
  },
  channelResult,
  fakeClientCalls: clientCalls,
  responses: rows
};

function tableEscape(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ");
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function presentationText(value) {
  return String(value)
    .replace(/```/g, "")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPreviewHtml({ brief, rows, channelResult, generatedAt }) {
  const responseCards = rows.map((row) => `
        <article class="response-card">
          <div class="response-topline">
            <span>${htmlEscape(row.label)}</span>
            <strong>${htmlEscape(row.responseType)}</strong>
          </div>
          <p>${htmlEscape(presentationText(row.excerpt))}</p>
          <div class="terms">${htmlEscape(row.expectedTerms.join(" | "))}</div>
        </article>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SignalDesk Slack Interaction Preview</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1d1c1d;
      --muted: #616061;
      --line: #d6d6d6;
      --panel: #ffffff;
      --slack: #4a154b;
      --green: #007a5a;
      --blue: #1264a3;
      --amber: #f2c744;
      font-family: Arial, Helvetica, sans-serif;
    }

    body {
      margin: 0;
      background: #f8f8f8;
      color: var(--ink);
    }

    .layout {
      display: grid;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }

    aside {
      background: var(--slack);
      color: #ffffff;
      padding: 28px 22px;
    }

    aside h1 {
      font-size: 20px;
      line-height: 1.2;
      margin: 0 0 28px;
    }

    .channel {
      border-radius: 6px;
      padding: 10px 12px;
      margin: 8px 0;
      color: #f7f3f7;
    }

    .channel.active {
      background: var(--blue);
    }

    main {
      padding: 28px;
    }

    .hero {
      background: var(--panel);
      border: 1px solid var(--line);
      border-left: 5px solid #e01e5a;
      border-radius: 8px;
      padding: 22px;
      max-width: 1100px;
    }

    .hero h2 {
      margin: 0 0 8px;
      font-size: 26px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(140px, 1fr));
      gap: 10px;
      margin: 20px 0;
    }

    .meta {
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 10px;
      background: #fbfbfb;
    }

    .meta b {
      display: block;
      font-size: 12px;
      margin-bottom: 6px;
      color: var(--muted);
      text-transform: uppercase;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }

    .button {
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 10px 14px;
      background: #ffffff;
      font-weight: 700;
    }

    .button.primary {
      background: var(--green);
      border-color: var(--green);
      color: #ffffff;
    }

    .section-title {
      margin: 28px 0 12px;
      font-size: 18px;
    }

    .responses {
      display: grid;
      grid-template-columns: repeat(2, minmax(280px, 1fr));
      gap: 14px;
      max-width: 1100px;
    }

    .response-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      min-height: 140px;
    }

    .response-topline {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .response-topline strong {
      color: var(--green);
      font-size: 12px;
      text-transform: uppercase;
    }

    .response-card p {
      color: var(--muted);
      line-height: 1.45;
      margin: 0 0 12px;
    }

    .terms {
      border-top: 1px solid var(--line);
      color: var(--blue);
      font-family: Consolas, "Courier New", monospace;
      font-size: 12px;
      padding-top: 10px;
    }

    .notice {
      background: #fff7d6;
      border: 1px solid var(--amber);
      border-radius: 8px;
      line-height: 1.45;
      margin-top: 22px;
      max-width: 1100px;
      padding: 14px 16px;
    }

    @media (max-width: 860px) {
      .layout {
        grid-template-columns: 1fr;
      }

      aside {
        padding: 18px;
      }

      .meta-grid,
      .responses {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <h1>SignalDesk Interaction Preview</h1>
      <div class="channel"># general</div>
      <div class="channel active"># security-help</div>
      <div class="channel"># inc-token-exposure</div>
    </aside>
    <main>
      <section class="hero">
        <h2>Button-driven Slack handoff</h2>
        <p>${htmlEscape(brief.summary)}</p>
        <div class="meta-grid">
          <div class="meta"><b>Runtime</b>${htmlEscape(brief.runtime.mode)} via ${htmlEscape(brief.runtime.tool)}</div>
          <div class="meta"><b>Scenario</b>${htmlEscape(brief.scenario.label)}</div>
          <div class="meta"><b>Severity</b>${htmlEscape(brief.severity.label)} ${brief.severity.score}/100</div>
          <div class="meta"><b>Channel</b>#${htmlEscape(channelResult.channelName)}</div>
        </div>
        <div class="actions">
          <span class="button primary">Create channel</span>
          <span class="button">Take owner</span>
          <span class="button">Show checklist</span>
          <span class="button">Evidence</span>
          <span class="button">Detections</span>
          <span class="button">Report</span>
          <span class="button">Guardrails</span>
        </div>
      </section>

      <h3 class="section-title">Action Response Contact Sheet</h3>
      <section class="responses">
${responseCards}
      </section>

      <section class="notice">
        Generated ${htmlEscape(generatedAt)} by <code>npm.cmd run slack:interactions:proof</code>.
        This is synthetic repo-local proof for judges and recording prep. It does not prove live Slack sandbox delivery.
      </section>
    </main>
  </div>
</body>
</html>
`;
}

const markdown = [
  "# SignalDesk Slack Interaction Transcript",
  "",
  `Generated: ${generatedAt}`,
  "",
  "Generated by `npm.cmd run slack:interactions:proof` using synthetic data. This proves the repo-local Slack action response builders and fake channel workflow; it does not replace live Slack sandbox delivery.",
  "",
  "Visual contact sheet: `docs/slack-interaction-preview.html`.",
  "",
  "## Runtime Proof",
  "",
  `- Runtime: ${brief.runtime.mode} via ${brief.runtime.tool}`,
  `- Scenario: ${brief.scenario.label}`,
  `- Severity: ${brief.severity.label} (${brief.severity.score}/100)`,
  `- Block Kit: ${blockValidation.summary.blocks} blocks, ${blockValidation.summary.actionsBlocks} action block(s), ${blockValidation.summary.interactiveElements} interactive element(s)`,
  `- Private synthetic brief recovery: PASS (${recoveryDirectory})`,
  `- Fake channel result: #${channelResult.channelName} (${channelResult.channelId})`,
  "",
  "## Action Responses",
  "",
  "| Interaction | Response type | Text length | Proof terms | Excerpt |",
  "| --- | --- | ---: | --- | --- |",
  ...rows.map((row) => `| ${tableEscape(row.label)} | ${tableEscape(row.responseType)} | ${row.textLength} | ${tableEscape(row.expectedTerms.join(", "))} | ${tableEscape(row.excerpt)} |`),
  "",
  "## Fake Slack Client Calls",
  "",
  "| Call | Detail |",
  "| --- | --- |",
  ...clientCalls.map((call) => `| ${tableEscape(call.method)} | ${tableEscape(JSON.stringify(call.payload))} |`),
  "",
  "## Evidence Boundary",
  "",
  "This transcript validates the local interaction payloads that back the live Slack buttons: ownership, channel creation, checklist, evidence, detections, report export, and guardrails. Live submission still requires the app to be installed in a judge-accessible Slack developer sandbox."
].join("\n");

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/slack-interaction-transcript.json`, `${JSON.stringify(proof, null, 2)}\n`);
writeFileSync("docs/slack-interaction-transcript.md", `${markdown}\n`);
writeFileSync("docs/slack-interaction-preview.html", formatPreviewHtml({
  brief,
  rows,
  channelResult,
  generatedAt
}));

console.log("| Interaction | Response type | Text length | Result |");
console.log("| --- | --- | ---: | --- |");
for (const row of rows) {
  console.log(`| ${row.label} | ${row.responseType} | ${row.textLength} | PASS |`);
}
console.log("\nSlack interaction transcript written to docs/slack-interaction-transcript.md.");
console.log("Slack interaction preview written to docs/slack-interaction-preview.html.");
