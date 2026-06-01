import { buildSlackBlocks } from "../src/core/incidentBrief.js";
import { sampleIncidents } from "../src/core/sampleIncidents.js";
import {
  buildAppHomeView,
  buildHomeDemoGuideModal,
  buildHomeProofChecklistModal,
  buildSignalDeskHelp,
  buildSignalDeskProof
} from "../src/slack/appHome.js";
import { assertSlackBlocksValid } from "../src/slack/blockKitValidation.js";
import { buildTriageErrorPayload } from "../src/slack/errorResponses.js";
import { buildBriefForSlack } from "../src/slack/triageRuntime.js";

const rows = [];

for (const sample of sampleIncidents) {
  const brief = await buildBriefForSlack({
    alertText: sample.alertText,
    reporter: "block-kit-check",
    channel: "security-help",
    mode: "local"
  });
  const result = assertSlackBlocksValid(buildSlackBlocks(brief));

  rows.push({
    fixture: sample.id,
    runtime: brief.runtime.mode,
    blocks: result.summary.blocks,
    actions: result.summary.actionsBlocks,
    elements: result.summary.interactiveElements
  });
}

const mcpBrief = await buildBriefForSlack({
  alertText: sampleIncidents[0].alertText,
  reporter: "block-kit-check",
  channel: "security-help",
  mode: "mcp"
});
const mcpResult = assertSlackBlocksValid(buildSlackBlocks(mcpBrief));
rows.push({
  fixture: `${sampleIncidents[0].id}-mcp`,
  runtime: mcpBrief.runtime.mode,
  blocks: mcpResult.summary.blocks,
  actions: mcpResult.summary.actionsBlocks,
  elements: mcpResult.summary.interactiveElements
});

const homeResult = assertSlackBlocksValid(buildAppHomeView({ runtimeMode: "mcp" }).blocks);
rows.push({
  fixture: "app-home",
  runtime: "mcp",
  blocks: homeResult.summary.blocks,
  actions: homeResult.summary.actionsBlocks,
  elements: homeResult.summary.interactiveElements
});

const helpResult = assertSlackBlocksValid(buildSignalDeskHelp({ runtimeMode: "mcp" }).blocks);
rows.push({
  fixture: "help",
  runtime: "mcp",
  blocks: helpResult.summary.blocks,
  actions: helpResult.summary.actionsBlocks,
  elements: helpResult.summary.interactiveElements
});

const proofResult = assertSlackBlocksValid(buildSignalDeskProof({ runtimeMode: "mcp" }).blocks);
rows.push({
  fixture: "proof-checklist",
  runtime: "mcp",
  blocks: proofResult.summary.blocks,
  actions: proofResult.summary.actionsBlocks,
  elements: proofResult.summary.interactiveElements
});

const demoGuideResult = assertSlackBlocksValid(buildHomeDemoGuideModal({ runtimeMode: "mcp" }).blocks);
rows.push({
  fixture: "home-demo-guide-modal",
  runtime: "mcp",
  blocks: demoGuideResult.summary.blocks,
  actions: demoGuideResult.summary.actionsBlocks,
  elements: demoGuideResult.summary.interactiveElements
});

const proofChecklistResult = assertSlackBlocksValid(buildHomeProofChecklistModal({ runtimeMode: "mcp" }).blocks);
rows.push({
  fixture: "home-proof-checklist-modal",
  runtime: "mcp",
  blocks: proofChecklistResult.summary.blocks,
  actions: proofChecklistResult.summary.actionsBlocks,
  elements: proofChecklistResult.summary.interactiveElements
});

const errorResult = assertSlackBlocksValid(buildTriageErrorPayload({
  runtimeMode: "mcp",
  error: new Error("runtime unavailable")
}).blocks);
rows.push({
  fixture: "triage-error",
  runtime: "mcp",
  blocks: errorResult.summary.blocks,
  actions: errorResult.summary.actionsBlocks,
  elements: errorResult.summary.interactiveElements
});

console.log("| Fixture | Runtime | Blocks | Action Blocks | Interactive Elements | Result |");
console.log("| --- | --- | ---: | ---: | ---: | --- |");
for (const row of rows) {
  console.log(`| ${row.fixture} | ${row.runtime} | ${row.blocks} | ${row.actions} | ${row.elements} | PASS |`);
}
