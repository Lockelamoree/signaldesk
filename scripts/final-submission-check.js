import { existsSync, readFileSync } from "node:fs";

const checks = [];
const onlineMode = process.argv.includes("--online");

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function section(markdown, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|\\n)## ${escapedName}\\n\\n([\\s\\S]*?)(?=\\n## |\\n# |$)`);
  return markdown.match(pattern)?.[1].trim() ?? "";
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

function publicHttpUrlOk(value) {
  if (!looksLikeHttpUrl(value)) return false;
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  return host !== "localhost"
    && host !== "0.0.0.0"
    && host !== "::1"
    && host !== "[::1]"
    && !host.endsWith(".local")
    && !privateIpv4(host)
    && !value.includes("TODO_")
    && !value.includes("example.")
    && !placeholderishUrl(value);
}

function placeholderishUrl(value) {
  return /(?:^|[/?#&=._-])(OWNER|REPO|VIDEO_ID|WORKSPACE|CHANGE_ME|REPLACE_ME|PLACEHOLDER|YOUR_URL|YOUR-URL)(?:$|[/?#&=._-])/i.test(value);
}

function allowedVideoHost(value) {
  if (!looksLikeHttpUrl(value)) return false;
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

async function fetchWithTimeout(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "SignalDeskSubmitGate"
      }
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkReachable(label, value, { allowAuthGate = false } = {}) {
  if (!publicHttpUrlOk(value)) {
    check(`${label} URL reachable`, false, "not a public http(s) URL");
    return;
  }

  try {
    let response = await fetchWithTimeout(value, "HEAD");
    if ([403, 405, 501].includes(response.status)) {
      response = await fetchWithTimeout(value, "GET");
    }
    const reachable = response.status >= 200 && response.status < 400;
    const authGated = allowAuthGate && [401, 403].includes(response.status);
    check(`${label} URL reachable`, reachable || authGated, `HTTP ${response.status} ${response.url}`);
  } catch (error) {
    check(`${label} URL reachable`, false, error?.message ?? "request failed");
  }
}

function tokenOk(name, prefix) {
  const value = process.env[name] ?? "";
  return value.startsWith(prefix) && !value.includes("redacted") && !value.includes("your-");
}

const devpostForm = readFileSync("docs/devpost-form.md", "utf8");
const videoPackage = readFileSync("docs/video-package.md", "utf8");
const judgeProof = existsSync("docs/judge-proof.md") ? readFileSync("docs/judge-proof.md", "utf8") : "";
const rulesCompliance = existsSync("docs/rules-compliance.md") ? readFileSync("docs/rules-compliance.md", "utf8") : "";

const placeholders = [
  "TODO_PUBLIC_REPO_URL",
  "TODO_DEMO_VIDEO_URL",
  "TODO_SLACK_SANDBOX_URL",
  "TODO_DEVPOST_PROJECT_URL",
  "TODO_DEVPOST_URL"
];

check("Devpost form has no TODO placeholders", !placeholders.some((placeholder) => devpostForm.includes(placeholder)), "docs/devpost-form.md");
check("Video package has no TODO placeholders", !placeholders.some((placeholder) => videoPackage.includes(placeholder)), "docs/video-package.md");

const publicRepoUrl = urlFromLine(devpostForm, "Public repository");
const demoVideoUrl = urlFromLine(devpostForm, "Demo video");
const sandboxUrl = urlFromLine(devpostForm, "Slack developer sandbox");
const devpostUrl = urlFromLine(devpostForm, "Devpost project");

check("Public repository URL is http(s)", looksLikeHttpUrl(publicRepoUrl), publicRepoUrl || "missing");
check("Demo video URL is http(s)", looksLikeHttpUrl(demoVideoUrl), demoVideoUrl || "missing");
check("Slack sandbox URL is http(s)", looksLikeHttpUrl(sandboxUrl), sandboxUrl || "missing");
check("Devpost project URL is http(s)", looksLikeHttpUrl(devpostUrl), devpostUrl || "missing");
check("Public repository URL is public", publicHttpUrlOk(publicRepoUrl), publicRepoUrl || "missing");
check("Demo video URL is public", publicHttpUrlOk(demoVideoUrl), demoVideoUrl || "missing");
check("Demo video uses allowed host", allowedVideoHost(demoVideoUrl), demoVideoUrl || "missing");
check("Slack sandbox URL is public", publicHttpUrlOk(sandboxUrl), sandboxUrl || "missing");
check("Devpost project URL is public", publicHttpUrlOk(devpostUrl), devpostUrl || "missing");
check("Demo video is not marked TODO", !/TODO/i.test(demoVideoUrl), demoVideoUrl || "missing");
check("Sandbox instructions include judge emails", devpostForm.includes("slackhack@salesforce.com") && devpostForm.includes("testing@devpost.com"), "judge access required");

if (onlineMode) {
  await checkReachable("Public repository", publicRepoUrl);
  await checkReachable("Demo video", demoVideoUrl);
  await checkReachable("Slack sandbox", sandboxUrl, { allowAuthGate: true });
  await checkReachable("Devpost project", devpostUrl);
}

check("SLACK_BOT_TOKEN has xoxb prefix", tokenOk("SLACK_BOT_TOKEN", "xoxb-"), process.env.SLACK_BOT_TOKEN ? "xoxb... candidate" : "missing");
check("SLACK_APP_TOKEN has xapp prefix", tokenOk("SLACK_APP_TOKEN", "xapp-"), process.env.SLACK_APP_TOKEN ? "xapp... candidate" : "missing");
check("SIGNALDESK_TRIAGE_MODE=mcp", process.env.SIGNALDESK_TRIAGE_MODE === "mcp", process.env.SIGNALDESK_TRIAGE_MODE || "missing");

check("Architecture diagram exists", existsSync("docs/architecture.svg"), "docs/architecture.svg");
check("Judge evidence matrix exists", existsSync("docs/judge-evidence-matrix.md"), "docs/judge-evidence-matrix.md");
check("Static demo preview screenshot exists", existsSync("docs/demo-preview.png"), "docs/demo-preview.png");
check("Thumbnail exists", existsSync("docs/thumbnail.svg"), "docs/thumbnail.svg");
check("Upload-ready thumbnail PNG exists", existsSync("docs/thumbnail.png"), "docs/thumbnail.png");
check("Uploadable captions exist", existsSync("docs/demo-captions.vtt"), "docs/demo-captions.vtt");
check("Judge proof pack exists", existsSync("docs/judge-proof.md"), "docs/judge-proof.md");
check("Judge proof pack latest local result passed", judgeProof.includes("Overall result: **PASS**"), "run npm.cmd run proof:pack");
check("Judge proof pack records external gate warning", judgeProof.includes("External Gates Still Required"), "evidence honesty");
check("Rules compliance map exists", rulesCompliance.includes("Manual Final Attestations"), "docs/rules-compliance.md");

const pitch = section(devpostForm, "Elevator Pitch");
check("Elevator pitch <= 200 chars", pitch.length > 0 && pitch.length <= 200, `${pitch.length} chars`);
check("Track is Slack Agent for Good", section(devpostForm, "Track") === "Slack Agent for Good", section(devpostForm, "Track"));

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.detail).replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Final submission check failed with ${failures.length} issue(s).`);
  console.error("This is expected until live URLs are filled in and real Slack tokens are set.");
  if (!onlineMode) {
    console.error("After URLs exist, run `npm.cmd run submission:final:online` to verify public link reachability.");
  }
  process.exitCode = 1;
} else {
  console.log(onlineMode
    ? "\nFinal submission check passed with online reachability checks. Re-open all public links in a private/incognito browser before clicking Submit."
    : "\nFinal submission check passed. Run `npm.cmd run submission:final:online` and re-open all public links in a private/incognito browser before clicking Submit.");
}
