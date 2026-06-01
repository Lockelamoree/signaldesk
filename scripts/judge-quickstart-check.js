import { existsSync, readFileSync } from "node:fs";

const quickstartPath = "docs/judge-quickstart.md";
const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function read(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function includesAll(value, terms) {
  return terms.every((term) => value.includes(term));
}

const quickstart = read(quickstartPath);
const packageJson = JSON.parse(read("package.json") || "{}");

check("judge quickstart exists", existsSync(quickstartPath), quickstartPath);
check("quickstart has local proof path", includesAll(quickstart, [
  "npm.cmd ci --ignore-scripts",
  "npm.cmd run verify",
  "npm.cmd run proof:pack"
]), "clone-to-proof commands");
check("quickstart points to primary artifacts", includesAll(quickstart, [
  "README.md",
  "docs/demo-preview.png",
  "docs/judge-proof.md",
  "docs/impact-evaluation.md",
  "docs/recording-readiness.md",
  "docs/slack-interaction-transcript.md",
  "docs/rules-compliance.md",
  "docs/architecture.svg",
  "docs/judge-evidence-matrix.md"
]), "judge inspection order");
check("quickstart preserves storyboard boundary", quickstart.includes("not a substitute for live Slack sandbox footage"), "evidence honesty");
check("quickstart names MCP smoke commands", includesAll(quickstart, [
  "npm.cmd run slack:interactions:proof",
  "npm.cmd run smoke:mcp",
  "npm.cmd run mcp:transcript",
  "npm.cmd run smoke:slack-mcp",
  "triage_slack_alert",
  "build_impact_summary",
  "build_detection_plan",
  "runtime.mode: mcp",
  "runtime.transport: stdio"
]), "required technology proof");
check("quickstart names interaction transcript", includesAll(quickstart, [
  "docs/slack-interaction-transcript.md",
  "ownership",
  "channel creation",
  "detections",
  "report",
  "guardrails"
]), "interactive workflow proof");
check("quickstart names live Slack proof path", includesAll(quickstart, [
  "manifest.json",
  "SLACK_BOT_TOKEN",
  "SLACK_APP_TOKEN",
  "SIGNALDESK_TRIAGE_MODE=\"mcp\"",
  "npm.cmd run sandbox:doctor -- --strict",
  "npm.cmd run start",
  "/signaldesk demo",
  "Triage with SignalDesk",
  "Runtime: MCP stdio",
  "Create channel"
]), "live sandbox path");
check("quickstart names final submission gates", includesAll(quickstart, [
  "npm.cmd run recording:check",
  "npm.cmd run rules:check",
  "npm.cmd run submission:final:check",
  "npm.cmd run submission:final:online",
  "slackhack@salesforce.com",
  "testing@devpost.com"
]), "Devpost closeout");
check("quickstart names video host rule", includesAll(quickstart, [
  "YouTube",
  "Vimeo",
  "Facebook Video",
  "Youku"
]), "allowed video host");
check("quickstart maps all rubric criteria", includesAll(quickstart, [
  "Technological Implementation",
  "Design",
  "Potential Impact",
  "Quality of the Idea"
]), "rubric map");
check("quickstart separates confirmed and external gates", includesAll(quickstart, [
  "Confirmed locally",
  "Still external",
  "live Slack sandbox install",
  "public or unlisted demo video"
]), "evidence boundary");

for (const script of [
  "verify",
  "proof:pack",
  "slack:interactions:proof",
  "smoke:mcp",
  "mcp:transcript",
  "smoke:slack-mcp",
  "recording:check",
  "rules:check",
  "submission:final:check",
  "submission:final:online",
  "sandbox:doctor"
]) {
  check(`referenced script exists: ${script}`, typeof packageJson.scripts?.[script] === "string", packageJson.scripts?.[script] ?? "missing");
}

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.detail).replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Judge quickstart check failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nJudge quickstart checks passed.");
}
