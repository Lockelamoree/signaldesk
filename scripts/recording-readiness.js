import { existsSync, readFileSync, writeFileSync } from "node:fs";

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function read(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function containsAll(value, terms) {
  return terms.every((term) => value.includes(term));
}

function tableEscape(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ");
}

function pngDimensions(file) {
  if (!existsSync(file)) return null;
  const buffer = readFileSync(file);
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length
  };
}

const packageJson = JSON.parse(read("package.json") || "{}");
const readme = read("README.md");
const rulesCompliance = read("docs/rules-compliance.md");
const demoScript = read("docs/demo-script.md");
const demoTranscript = read("docs/demo-transcript.md");
const videoPackage = read("docs/video-package.md");
const captions = read("docs/demo-captions.vtt");
const judgeProof = read("docs/judge-proof.md");
const impactEvaluation = read("docs/impact-evaluation.md");
const slackUxProof = read("docs/slack-ux-proof.md");
const slackInteractionTranscript = read("docs/slack-interaction-transcript.md");
const mcpTranscript = read("docs/mcp-tool-transcript.md");
const sandboxRunbook = read("docs/slack-sandbox-runbook.md");
const matrix = read("docs/judge-evidence-matrix.md");
const thumbnail = pngDimensions("docs/thumbnail.png");
const preview = pngDimensions("docs/demo-preview.png");

const requiredFiles = [
  "docs/demo-script.md",
  "docs/demo-transcript.md",
  "docs/video-package.md",
  "docs/rules-compliance.md",
  "docs/demo-captions.vtt",
  "docs/thumbnail.png",
  "docs/demo-preview.png",
  "docs/judge-proof.md",
  "docs/impact-evaluation.md",
  "docs/slack-ux-proof.md",
  "docs/slack-interaction-transcript.md",
  "docs/mcp-tool-transcript.md",
  "docs/slack-sandbox-runbook.md",
  "docs/judge-evidence-matrix.md",
  "docs/devpost-form.md"
];

for (const file of requiredFiles) {
  check(`recording file ${file}`, existsSync(file), "required recording artifact");
}

check("video target stays under three minutes", videoPackage.includes("Target length: 2:40-2:55"), "judges may stop at three minutes");
check("shot order opens with user problem", containsAll(videoPackage, ["0:00-0:12", "Small teams coordinate security incidents in Slack"]), "first 12 seconds");
check("shot order shows Slack proof before 30 seconds", containsAll(videoPackage, ["0:12-0:28", "Slack sandbox", "App Home", "Demo guide", "Proof checklist", "/signaldesk proof", "/signaldesk demo", "Triage with SignalDesk"]), "first 30 seconds");
check("shot order shows MCP runtime before workflow depth", containsAll(videoPackage, ["0:28-1:10", "MCP stdio", "evidence IDs", "first-response readiness"]), "required tech and proof");
check("shot order includes incident channel creation", containsAll(videoPackage, ["1:10-1:35", "Create channel", "#inc-token-exposure"]), "complete Slack workflow");
check("shot order includes MCP proof", containsAll(videoPackage, ["smoke:slack-mcp", "mcp:transcript", "triage_slack_alert", "build_impact_summary"]), "integration proof");
check("shot order includes impact close", containsAll(videoPackage, ["2:30-2:50", "safe first 15 minutes"]), "Agent for Good close");
check("rules compliance map covers video restrictions", containsAll(rulesCompliance, ["less than three minutes", "YouTube", "sensitive information", "Manual Final Attestations"]), "official rules preflight");
check("demo script names live sandbox requirement", demoScript.includes("live sandbox") && demoScript.includes("storyboard preview, not as final proof"), "evidence boundary");
check("demo script includes short demo fallback command", demoScript.includes("/signaldesk demo"), "recording fallback");
check("demo script includes proof command", demoScript.includes("/signaldesk proof"), "judge proof checklist");
check("demo transcript includes expected MCP tools", containsAll(demoTranscript, [
  "triage_slack_alert",
  "build_response_checklist",
  "build_impact_summary",
  "export_evidence_ledger",
  "build_detection_plan",
  "generate_incident_report",
  "list_demo_incidents"
]), "MCP proof list");
check("captions are WebVTT", captions.startsWith("WEBVTT"), "uploadable captions");
check("captions mention required proof terms", containsAll(captions, ["Slack", "MCP", "evidence", "detections"]), "caption proof terms");
check("thumbnail is 1280x720 PNG", thumbnail?.width === 1280 && thumbnail?.height === 720, thumbnail ? `${thumbnail.width}x${thumbnail.height}, ${thumbnail.bytes} bytes` : "missing");
check("demo preview is 1440x1000 PNG", preview?.width === 1440 && preview?.height === 1000, preview ? `${preview.width}x${preview.height}, ${preview.bytes} bytes` : "missing");
check("judge proof latest result passes", judgeProof.includes("Overall result: **PASS**"), "docs/judge-proof.md");
check("impact evaluation latest result passes", impactEvaluation.includes("Overall result: **PASS**") && impactEvaluation.includes("98.3/100"), "Potential Impact proof");
check("Slack UX proof includes App Home surfaces", containsAll(slackUxProof, ["App Home", "Slash Proof Checklist", "Demo Guide Modal", "Proof Checklist Modal"]), "Best UX proof");
check("Slack interaction transcript covers buttons", containsAll(slackInteractionTranscript, [
  "Take owner",
  "Create channel",
  "Show checklist",
  "Evidence",
  "Detections",
  "Report",
  "Guardrails",
  "Private synthetic brief recovery"
]), "interactive workflow proof");
check("MCP transcript includes every tool", containsAll(mcpTranscript, [
  "triage_slack_alert",
  "build_response_checklist",
  "build_impact_summary",
  "export_evidence_ledger",
  "build_detection_plan",
  "generate_incident_report",
  "list_demo_incidents"
]), "Best Technological Implementation proof");
check("sandbox runbook includes judge invite emails", containsAll(sandboxRunbook, ["slackhack@salesforce.com", "testing@devpost.com", "Member"]), "FAQ-aligned access");
check("sandbox runbook includes strict doctor", sandboxRunbook.includes("npm.cmd run sandbox:doctor -- --strict"), "live token preflight");
check("judge matrix names official criteria", containsAll(matrix, ["Technological Implementation", "Design", "Potential Impact", "Quality of the Idea"]), "rubric alignment");
check("README references recording package", readme.includes("docs/video-package.md") && readme.includes("docs/demo-captions.vtt"), "judge-facing repo");

for (const script of [
  "sandbox:doctor",
  "smoke:slack-mcp",
  "smoke:mcp",
  "mcp:transcript",
  "impact:evaluate",
  "slack:ux:proof",
  "slack:interactions:proof",
  "rules:check",
  "check:block-kit",
  "verify",
  "proof:pack",
  "submission:final:check",
  "submission:final:online"
]) {
  check(`script exists: ${script}`, typeof packageJson.scripts?.[script] === "string", packageJson.scripts?.[script] ?? "missing");
}

const rows = checks.map((item) => `| ${tableEscape(item.name)} | ${item.passed ? "PASS" : "FAIL"} | ${tableEscape(item.detail)} |`);
const failures = checks.filter((item) => !item.passed);

const markdown = [
  "# SignalDesk Recording Readiness",
  "",
  "Generated by `npm.cmd run recording:check`.",
  "",
  "This is a repo-local preflight for the final Devpost video. It does not prove live Slack sandbox delivery; it verifies that the recording package is ready to capture the live proof quickly and safely.",
  "",
  "## Result",
  "",
  `Overall result: **${failures.length ? "FAIL" : "PASS"}**`,
  "",
  "| Check | Result | Detail |",
  "| --- | --- | --- |",
  ...rows,
  "",
  "## Required Live Recording Proof",
  "",
  "- Live Slack developer sandbox, not the static storyboard.",
  "- Rules compliance check from `npm.cmd run rules:check` before final upload.",
  "- App Home `Demo guide` or `Proof checklist` modal in the first 30 seconds.",
  "- `/signaldesk proof` checklist, then message shortcut or `/signaldesk demo` flow immediately after App Home proof.",
  "- `Runtime: MCP stdio` visible in the incident brief.",
  "- Evidence IDs, claim audit, detection checks, first-response readiness, and guardrails.",
  "- `Create channel` action and the incident kickoff message.",
  "- Slack interaction transcript from `npm.cmd run slack:interactions:proof` as backup proof for button responses.",
  "- Terminal proof from `npm.cmd run smoke:slack-mcp`, `npm.cmd run smoke:mcp`, and `npm.cmd run impact:evaluate`.",
  "- Full MCP tool transcript from `npm.cmd run mcp:transcript`.",
  "- Judge sandbox access for `slackhack@salesforce.com` and `testing@devpost.com` as workspace Members.",
  "",
  "## Evidence Boundary",
  "",
  "This preflight supports the demo recording. The final submission still requires real Slack tokens, sandbox install, public or unlisted video, public repository URL, Devpost URL, and passing `npm.cmd run submission:final:online` after those URLs exist."
].join("\n");

writeFileSync("docs/recording-readiness.md", `${markdown}\n`);

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${tableEscape(item.detail)} |`);
}

if (failures.length) {
  console.error(`Recording readiness check failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nRecording readiness checks passed. Wrote docs/recording-readiness.md.");
}
