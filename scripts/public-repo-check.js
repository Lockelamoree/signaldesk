import { existsSync, readFileSync } from "node:fs";

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function contains(file, text) {
  return existsSync(file) && readFileSync(file, "utf8").includes(text);
}

const requiredFiles = [
  "README.md",
  "ARCHITECTURE.md",
  "LICENSE",
  "SECURITY.md",
  ".gitignore",
  ".github/workflows/ci.yml",
  "docs/github-repo-settings.md",
  "docs/live-gate-handoff.md",
  "docs/rules-compliance.md",
  "docs/judge-one-pager.md",
  "docs/judge-quickstart.md",
  "docs/impact-evaluation.md",
  "docs/judge-evidence-matrix.md",
  "docs/bonus-prize-map.md",
  "docs/slack-ux-proof.md",
  "docs/slack-interaction-transcript.md",
  "docs/mcp-tool-transcript.md",
  "docs/judge-proof.md",
  "docs/slack-sandbox-runbook.md",
  "docs/demo-captions.vtt",
  "docs/demo-preview.png",
  "docs/recording-readiness.md",
  "docs/devpost-form.md",
  "docs/thumbnail.svg",
  "docs/thumbnail.png",
  "docs/architecture.svg",
  "package-lock.json"
];

for (const file of requiredFiles) {
  check(`public file ${file}`, existsSync(file), "required public repo artifact");
}

check("README names Slack Agent for Good", contains("README.md", "Slack Agent for Good"), "track alignment");
check("README embeds demo preview screenshot", contains("README.md", "docs/demo-preview.png"), "judge-visible first screen");
check("README labels preview as storyboard", contains("README.md", "storyboard preview"), "evidence boundary");
check("README has judge test path", contains("README.md", "How Judges Can Test"), "judge landing path");
check("README links judge quickstart", contains("README.md", "docs/judge-quickstart.md"), "judge friction reducer");
check("README names App Home onboarding", contains("README.md", "App Home"), "judge onboarding surface");
check("README names App Home modals", contains("README.md", "Demo guide") && contains("README.md", "Proof checklist"), "Best UX proof");
check("README names short demo command", contains("README.md", "/signaldesk demo"), "judge low-friction path");
check("README names no-input help", contains("README.md", "demo help"), "judge no-input path");
check("README names MCP runtime", contains("README.md", "SIGNALDESK_TRIAGE_MODE=mcp"), "required tech proof");
check("README names safe runtime-check guidance", contains("README.md", "runtime-check guidance") && contains("README.md", "token-shaped strings"), "live demo failure safety");
check("README names private brief persistence boundary", contains("README.md", "SIGNALDESK_PERSIST_BRIEFS") && contains("README.md", "artifacts/private/"), "demo state safety");
check("README links impact evaluation", contains("README.md", "docs/impact-evaluation.md"), "Potential Impact proof");
check("README links recording readiness", contains("README.md", "docs/recording-readiness.md"), "demo preflight proof");
check("SECURITY warns against real Slack data", contains("SECURITY.md", "real Slack messages"), "public safety");
check("SECURITY names secret scan", contains("SECURITY.md", "npm.cmd run scan:secrets"), "pre-push safety");
check("CI runs verify", contains(".github/workflows/ci.yml", "npm run verify"), "public proof gate");
check("CI installs with ignore-scripts", contains(".github/workflows/ci.yml", "npm ci --ignore-scripts"), "supply-chain safety");
check(".gitignore excludes .env", contains(".gitignore", ".env"), "secret hygiene");
check(".gitignore keeps .env.example", contains(".gitignore", "!.env.example"), "setup usability");
check(".gitignore excludes private artifacts", contains(".gitignore", "artifacts/private/"), "private evidence hygiene");
check("GitHub settings include repo description", contains("docs/github-repo-settings.md", "MCP-backed Slack incident triage"), "public repo metadata");
check("Live handoff names account-bound gates", contains("docs/live-gate-handoff.md", "GitHub remote URL") && contains("docs/live-gate-handoff.md", "Slack sandbox URL") && contains("docs/live-gate-handoff.md", "Demo video URL"), "external gate handoff");
check("Rules compliance map covers video and sandbox", contains("docs/rules-compliance.md", "less than three minutes") && contains("docs/rules-compliance.md", "Slack developer sandbox URL"), "official rules map");
check("Judge one-pager maps rubric", contains("docs/judge-one-pager.md", "Technological Implementation") && contains("docs/judge-one-pager.md", "Evidence Boundary"), "30-second judge landing path");
check("Judge quickstart maps local and live proof", contains("docs/judge-quickstart.md", "npm.cmd run verify") && contains("docs/judge-quickstart.md", "Live Slack Sandbox Proof"), "judge test path");
check("Judge evidence matrix maps rubric", contains("docs/judge-evidence-matrix.md", "Technological Implementation"), "rubric evidence map");
check("Bonus prize map names side prizes", contains("docs/bonus-prize-map.md", "Best UX") && contains("docs/bonus-prize-map.md", "Most Innovative Slack Agent") && contains("docs/bonus-prize-map.md", "Best Technological Implementation"), "side-prize evidence map");
check("Slack UX proof maps modals", contains("docs/slack-ux-proof.md", "Demo Guide Modal") && contains("docs/slack-ux-proof.md", "Proof Checklist Modal"), "Best UX proof artifact");
check("Slack interaction transcript maps buttons", contains("docs/slack-interaction-transcript.md", "Create channel") && contains("docs/slack-interaction-transcript.md", "Detections") && contains("docs/slack-interaction-transcript.md", "Report"), "interactive workflow artifact");
check("MCP transcript maps all tools", contains("docs/mcp-tool-transcript.md", "triage_slack_alert") && contains("docs/mcp-tool-transcript.md", "list_demo_incidents"), "Best Technological Implementation artifact");
check("Impact evaluation records PASS", contains("docs/impact-evaluation.md", "Overall result: **PASS**"), "Agent for Good impact proof");
check("Recording readiness records PASS", contains("docs/recording-readiness.md", "Overall result: **PASS**"), "demo proof preflight");
check("GitHub settings include topics", contains("docs/github-repo-settings.md", "incident-response"), "discoverability");
check("Judge proof records PASS", contains("docs/judge-proof.md", "Overall result: **PASS**"), "latest proof pack");

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.detail).replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Public repo check failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nPublic repo readiness checks passed.");
  console.log("Still inspect the public GitHub URL in a private/incognito browser before adding it to Devpost.");
}
