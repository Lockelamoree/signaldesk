import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const generatedAt = new Date().toISOString();
const outDir = "artifacts/submission";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: String(result.stdout ?? "").trim(),
    stderr: String(result.stderr ?? "").trim()
  };
}

function read(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function tableEscape(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ");
}

function urlFromLine(markdown, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp("- " + escapedLabel + ": `?([^`\\n]+)`?");
  return markdown.match(pattern)?.[1].trim() ?? "";
}

function looksLikeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function privateIpv4(hostname) {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  return a === 10
    || a === 127
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 169 && b === 254)
    || a === 0;
}

function placeholderish(value) {
  return /(?:TODO_|OWNER|REPO|VIDEO_ID|WORKSPACE|CHANGE_ME|REPLACE_ME|PLACEHOLDER|YOUR_URL|YOUR-URL)/i.test(value);
}

function publicHttpUrlOk(value) {
  if (!looksLikeHttpUrl(value) || placeholderish(value)) return false;
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  return host !== "localhost"
    && host !== "0.0.0.0"
    && host !== "::1"
    && host !== "[::1]"
    && !host.endsWith(".local")
    && !privateIpv4(host)
    && !value.includes("example.");
}

function allowedVideoHost(value) {
  if (!publicHttpUrlOk(value)) return false;
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  return host === "youtu.be"
    || host === "youtube.com"
    || host.endsWith(".youtube.com")
    || host === "vimeo.com"
    || host.endsWith(".vimeo.com")
    || host === "facebook.com"
    || host.endsWith(".facebook.com")
    || host === "fb.watch"
    || host.endsWith(".fb.watch")
    || host === "youku.com"
    || host.endsWith(".youku.com");
}

function devpostHost(value) {
  if (!publicHttpUrlOk(value)) return false;
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  return host === "devpost.com" || host.endsWith(".devpost.com");
}

function githubRemoteOk(value) {
  if (!value || placeholderish(value)) return false;
  return /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+(?:\.git)?$/i.test(value)
    || /^git@github\.com:[^/\s]+\/[^/\s]+\.git$/i.test(value);
}

function tokenOk(name, prefix) {
  const value = process.env[name] ?? "";
  return value.startsWith(prefix) && !value.includes("redacted") && !value.includes("your-");
}

function boolEnv(name) {
  return /^(1|true|yes)$/i.test(process.env[name] ?? "");
}

function statusLabel(ready, manual = false) {
  if (ready) return "READY";
  return manual ? "MANUAL" : "PENDING";
}

const devpostForm = read("docs/devpost-form.md");
const videoPackage = read("docs/video-package.md");
const branch = run("git", ["branch", "--show-current"]).stdout;
const head = run("git", ["rev-parse", "--short=12", "HEAD"]);
const status = run("git", ["status", "--porcelain"]).stdout;
const origin = run("git", ["remote", "get-url", "origin"]);
const upstream = run("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);

const urls = {
  publicRepository: urlFromLine(devpostForm, "Public repository"),
  demoVideo: urlFromLine(devpostForm, "Demo video"),
  slackSandbox: urlFromLine(devpostForm, "Slack developer sandbox"),
  devpostProject: urlFromLine(devpostForm, "Devpost project")
};

const hasTodoPlaceholders = /TODO_/i.test(devpostForm) || /TODO_/i.test(videoPackage);
const tokensReady = tokenOk("SLACK_BOT_TOKEN", "xoxb-") && tokenOk("SLACK_APP_TOKEN", "xapp-");
const mcpModeReady = process.env.SIGNALDESK_TRIAGE_MODE === "mcp";
const judgeAccessConfirmed = boolEnv("SIGNALDESK_JUDGE_ACCESS_CONFIRMED");

const facts = [
  ["Branch", branch || "missing"],
  ["HEAD", head.ok ? head.stdout : "missing"],
  ["Worktree", status ? `${status.split(/\r?\n/).filter(Boolean).length} change(s)` : "clean"],
  ["Origin", origin.ok ? origin.stdout : "missing"],
  ["Upstream", upstream.ok ? upstream.stdout : "missing"],
  ["Public repo field", urls.publicRepository || "missing"],
  ["Demo video field", urls.demoVideo || "missing"],
  ["Slack sandbox field", urls.slackSandbox || "missing"],
  ["Devpost field", urls.devpostProject || "missing"],
  ["Slack token env", tokensReady ? "present with expected prefixes" : "missing or placeholder"],
  ["MCP triage mode", mcpModeReady ? "SIGNALDESK_TRIAGE_MODE=mcp" : "missing or not mcp"]
];

const repoReady = branch === "main"
  && !status
  && origin.ok
  && githubRemoteOk(origin.stdout)
  && upstream.ok
  && publicHttpUrlOk(urls.publicRepository);
const videoReady = publicHttpUrlOk(urls.demoVideo) && allowedVideoHost(urls.demoVideo);
const sandboxReady = publicHttpUrlOk(urls.slackSandbox) && tokensReady && mcpModeReady;
const devpostReady = devpostHost(urls.devpostProject);
const placeholdersReady = !hasTodoPlaceholders;
const finalReady = repoReady && videoReady && sandboxReady && devpostReady && placeholdersReady && judgeAccessConfirmed;

const gates = [
  {
    gate: "Public GitHub repository",
    status: statusLabel(repoReady),
    evidence: repoReady ? urls.publicRepository : "origin/upstream/public URL still incomplete",
    next: "Create public GitHub repo, add it as origin, push main with -u, run github:launch:strict, verify in private browser, then run submission:set-urls."
  },
  {
    gate: "Live Slack sandbox preflight",
    status: statusLabel(sandboxReady),
    evidence: sandboxReady ? urls.slackSandbox : "sandbox URL or real Slack token env is missing",
    next: "Create/install the Slack app from manifest.json, set xoxb/xapp tokens plus SIGNALDESK_TRIAGE_MODE=mcp, then run sandbox:doctor -- --strict."
  },
  {
    gate: "Judge sandbox access",
    status: statusLabel(judgeAccessConfirmed, true),
    evidence: judgeAccessConfirmed
      ? "SIGNALDESK_JUDGE_ACCESS_CONFIRMED is set"
      : "invite slackhack@salesforce.com and testing@devpost.com as full members",
    next: "Invite both judge emails, then set SIGNALDESK_JUDGE_ACCESS_CONFIRMED=1 for this local status command."
  },
  {
    gate: "Public or unlisted demo video",
    status: statusLabel(videoReady),
    evidence: videoReady ? urls.demoVideo : "YouTube/Vimeo/Facebook Video/Youku URL missing",
    next: "Record the live Slack sandbox flow under 3 minutes, upload it, check in private browser, then run submission:set-urls."
  },
  {
    gate: "Devpost project URL",
    status: statusLabel(devpostReady),
    evidence: devpostReady ? urls.devpostProject : "Devpost project URL missing",
    next: "Create/save the Devpost project draft and capture its devpost.com project URL."
  },
  {
    gate: "TODO placeholders removed",
    status: statusLabel(placeholdersReady),
    evidence: placeholdersReady ? "docs/devpost-form.md and docs/video-package.md" : "TODO placeholders still present",
    next: "Run submission:set-urls with the real public repo, demo video, sandbox, and Devpost URLs."
  },
  {
    gate: "Final external checks",
    status: statusLabel(finalReady),
    evidence: finalReady ? "all live-gate inputs present" : "submission:final:check and online reachability still need live inputs",
    next: "Run submission:final:check, then submission:final:online, then re-open every public link in a private browser before clicking Submit."
  }
];

const firstNext = gates.find((gate) => gate.status !== "READY");
const verdict = finalReady ? "READY_TO_SUBMIT" : "EXTERNAL_GATES_PENDING";

function formatMarkdown() {
  return [
    "# SignalDesk Live Submission Gate Status",
    "",
    `Generated: ${generatedAt}`,
    "",
    `Verdict: **${verdict}**`,
    "",
    firstNext ? `Fastest next action: ${firstNext.next}` : "Fastest next action: submit after final manual review.",
    "",
    "## Current Facts",
    "",
    "| Fact | Value |",
    "| --- | --- |",
    ...facts.map(([fact, value]) => `| ${tableEscape(fact)} | ${tableEscape(value)} |`),
    "",
    "## Gates",
    "",
    "| Gate | Status | Evidence | Next action |",
    "| --- | --- | --- | --- |",
    ...gates.map((gate) => `| ${tableEscape(gate.gate)} | ${gate.status} | ${tableEscape(gate.evidence)} | ${tableEscape(gate.next)} |`),
    "",
    "## Command Path",
    "",
    "```powershell",
    "npm.cmd run scan:secrets",
    "npm.cmd run verify",
    "npm.cmd run github:launch:check",
    "git remote add origin <public-github-url>.git",
    "git push -u origin main",
    "npm.cmd run github:launch:strict",
    "$env:SLACK_BOT_TOKEN=\"xoxb-redacted\"",
    "$env:SLACK_APP_TOKEN=\"xapp-redacted\"",
    "$env:SIGNALDESK_TRIAGE_MODE=\"mcp\"",
    "npm.cmd run sandbox:doctor -- --strict",
    "npm.cmd run submission:set-urls -- --repo <public-repo-url> --video <demo-video-url> --sandbox <slack-sandbox-url> --devpost <devpost-project-url>",
    "npm.cmd run submission:final:check",
    "npm.cmd run submission:final:online",
    "```",
    "",
    "## Notes",
    "",
    "- This status file is generated under `artifacts/submission/` and is ignored by Git.",
    "- Token checks only validate expected prefixes and never print token values.",
    "- `SIGNALDESK_JUDGE_ACCESS_CONFIRMED=1` is a local manual attestation after both judge emails are invited.",
    ""
  ].join("\n");
}

const markdown = formatMarkdown();
const output = {
  generatedAt,
  verdict,
  firstNextAction: firstNext?.next ?? "",
  facts: Object.fromEntries(facts),
  urls,
  gates
};

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/live-gate-status.md`, markdown);
writeFileSync(`${outDir}/live-gate-status.json`, `${JSON.stringify(output, null, 2)}\n`);

console.log(`SignalDesk live gate status: ${verdict}`);
if (firstNext) {
  console.log(`Next: ${firstNext.next}`);
}
console.log("");
console.log("| Gate | Status | Evidence |");
console.log("| --- | --- | --- |");
for (const gate of gates) {
  console.log(`| ${tableEscape(gate.gate)} | ${gate.status} | ${tableEscape(gate.evidence)} |`);
}
console.log("");
console.log("Wrote artifacts/submission/live-gate-status.md and artifacts/submission/live-gate-status.json.");
