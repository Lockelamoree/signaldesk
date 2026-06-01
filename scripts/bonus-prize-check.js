import { existsSync, readFileSync } from "node:fs";

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function containsAll(text, terms) {
  return terms.every((term) => text.includes(term));
}

const map = read("docs/bonus-prize-map.md");
const packageJson = JSON.parse(read("package.json"));
const slackUxProof = read("docs/slack-ux-proof.md");
const slackInteractionTranscript = read("docs/slack-interaction-transcript.md");
const mcpTranscript = read("docs/mcp-tool-transcript.md");
const impactEvaluation = read("docs/impact-evaluation.md");
const judgeMatrix = read("docs/judge-evidence-matrix.md");
const sampleReport = read("docs/sample-incident-report.md");

check("bonus prize map exists", Boolean(map), "docs/bonus-prize-map.md");
check("map names Best UX", map.includes("Best UX"), "side-prize target");
check("map names Most Innovative Slack Agent", map.includes("Most Innovative Slack Agent"), "side-prize target");
check("map names Best Technological Implementation", map.includes("Best Technological Implementation"), "side-prize target");
check("map keeps Agent for Good primary", map.includes("Slack Agent for Good"), "primary track");
check("map links UX evidence", containsAll(map, [
  "docs/slack-ux-proof.md",
  "docs/slack-interaction-transcript.md",
  "npm.cmd run slack:ux:proof",
  "npm.cmd run slack:interactions:proof",
  "npm.cmd run check:block-kit"
]), "Best UX evidence");
check("map links innovation evidence", containsAll(map, [
  "evidence-gated response workflow",
  "docs/impact-evaluation.md",
  "npm.cmd run validate:fixtures"
]), "Most Innovative evidence");
check("map links technology evidence", containsAll(map, [
  "docs/mcp-tool-transcript.md",
  "npm.cmd run mcp:transcript",
  "npm.cmd run smoke:slack-mcp",
  "npm.cmd run verify"
]), "Best Technological Implementation evidence");
check("map preserves live boundary", containsAll(map, [
  "live Slack sandbox proof",
  "sandbox credentials",
  "do not say it deserves or has won"
]), "evidence honesty");
check("map has no TODO placeholders", !/TODO_/i.test(map), "judge-facing artifact");
check("Slack UX proof supports Best UX", containsAll(slackUxProof, [
  "App Home",
  "Demo Guide Modal",
  "Proof Checklist Modal",
  "Runtime Error Guidance"
]), "docs/slack-ux-proof.md");
check("Slack interaction transcript supports Best UX", containsAll(slackInteractionTranscript, [
  "Take owner",
  "Create channel",
  "Detections",
  "Report",
  "Guardrails"
]), "docs/slack-interaction-transcript.md");
check("MCP transcript supports technology prize", containsAll(mcpTranscript, [
  "triage_slack_alert",
  "build_response_checklist",
  "build_impact_summary",
  "export_evidence_ledger",
  "build_detection_plan",
  "generate_incident_report",
  "list_demo_incidents"
]), "docs/mcp-tool-transcript.md");
check("impact evaluation supports innovation/impact story", impactEvaluation.includes("Overall result: **PASS**") && impactEvaluation.includes("98.3/100"), "docs/impact-evaluation.md");
check("judge matrix keeps official criteria visible", containsAll(judgeMatrix, [
  "Technological Implementation",
  "Design",
  "Potential Impact",
  "Quality of the Idea"
]), "docs/judge-evidence-matrix.md");
check("sample report shows evidence-gated output", containsAll(sampleReport, [
  "Evidence Ledger",
  "Claim Audit",
  "Detection Opportunities"
]), "docs/sample-incident-report.md");
check("slack:ux:proof script exists", typeof packageJson.scripts?.["slack:ux:proof"] === "string", "package.json");
check("slack:interactions:proof script exists", typeof packageJson.scripts?.["slack:interactions:proof"] === "string", "package.json");
check("mcp:transcript script exists", typeof packageJson.scripts?.["mcp:transcript"] === "string", "package.json");

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.detail).replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Bonus prize check failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nBonus prize map checks passed.");
}
