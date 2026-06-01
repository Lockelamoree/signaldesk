import { readFileSync } from "node:fs";

const markdown = readFileSync("docs/devpost-form.md", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

function section(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:^|\\n)## ${escapedName}\\n\\n([\\s\\S]*?)(?=\\n## |\\n# |$)`);
  const match = markdown.match(pattern);
  return match?.[1].trim() ?? "";
}

function urlFromLine(label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp("- " + escapedLabel + ": `?([^`\\n]+)`?");
  return markdown.match(pattern)?.[1].trim() ?? "";
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
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (url.protocol === "https:" || url.protocol === "http:")
      && host !== "localhost"
      && host !== "0.0.0.0"
      && host !== "::1"
      && host !== "[::1]"
      && !host.endsWith(".local")
      && !privateIpv4(host)
      && !value.includes("TODO_")
      && !value.includes("example.")
      && !placeholderishUrl(value);
  } catch {
    return false;
  }
}

function placeholderishUrl(value) {
  return /(?:^|[/?#&=._-])(OWNER|REPO|VIDEO_ID|WORKSPACE|CHANGE_ME|REPLACE_ME|PLACEHOLDER|YOUR_URL|YOUR-URL)(?:$|[/?#&=._-])/i.test(value);
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

function placeholderOrPublicUrl(label, placeholder, { video = false } = {}) {
  const value = urlFromLine(label);
  const valid = value === placeholder || (video ? allowedVideoHost(value) : publicHttpUrlOk(value));
  check(`${label} field is placeholder or final public URL`, valid, value || "missing");
}

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

const projectName = section("Project Name");
const elevatorPitch = section("Elevator Pitch");
const track = section("Track");
const builtWith = section("Built With");
const whatItDoes = section("What It Does");
const howBuilt = section("How We Built It");
const evidence = section("Required Evidence Checklist");

check("project name is SignalDesk", projectName === "SignalDesk", projectName);
check("elevator pitch present", elevatorPitch.length > 0, `${elevatorPitch.length} chars`);
check("elevator pitch <= 200 chars", elevatorPitch.length <= 200, `${elevatorPitch.length} chars`);
check("track is Agent for Good", track === "Slack Agent for Good", track);
check("built-with names Slack", builtWith.includes("Slack"), "required tech");
check("built-with names MCP", builtWith.includes("Model Context Protocol"), "required tech");
check("what-it-does names MCP runtime", whatItDoes.includes("SIGNALDESK_TRIAGE_MODE=mcp"), "integration proof");
check("what-it-does names App Home", whatItDoes.includes("App Home"), "judge onboarding proof");
check("what-it-does names App Home modals", whatItDoes.includes("demo/proof modals"), "Best UX proof");
check("what-it-does names short demo command", whatItDoes.includes("/signaldesk demo"), "judge low-friction proof");
check("what-it-does names proof command", whatItDoes.includes("/signaldesk proof"), "judge proof checklist");
check("what-it-does names demo help", whatItDoes.includes("demo help"), "judge no-input proof");
check("what-it-does names readiness metrics", whatItDoes.includes("first-response readiness"), "impact proof");
check("how-built names Slack-to-MCP bridge", howBuilt.includes("Slack-to-MCP bridge"), "runtime proof");
check("how-built names Slack interaction transcript", howBuilt.includes("Slack interaction transcript"), "interactive workflow proof");
check("how-built names visual interaction preview", howBuilt.includes("visual interaction preview"), "interactive visual proof");
check("how-built names rules compliance map", howBuilt.includes("rules compliance map"), "official rules proof");
check("how-built names impact evaluation", howBuilt.includes("Agent for Good impact evaluation"), "Potential Impact proof");
check("how-built names bonus-prize map", howBuilt.includes("bonus-prize evidence map"), "side-prize proof");
check("evidence checklist names judge proof", evidence.includes("docs/judge-proof.md"), "proof artifact");
check("evidence checklist names judge quickstart", evidence.includes("docs/judge-quickstart.md"), "judge test artifact");
check("evidence checklist names bonus prize map", evidence.includes("docs/bonus-prize-map.md"), "side-prize artifact");
check("evidence checklist names interaction transcript", evidence.includes("docs/slack-interaction-transcript.md"), "interactive workflow artifact");
check("evidence checklist names interaction preview", evidence.includes("docs/slack-interaction-preview.html"), "interactive visual artifact");
check("evidence checklist names rules compliance", evidence.includes("docs/rules-compliance.md"), "official rules artifact");
check("evidence checklist names impact evaluation", evidence.includes("docs/impact-evaluation.md"), "Potential Impact artifact");
check("evidence checklist names recording readiness", evidence.includes("docs/recording-readiness.md"), "demo preflight artifact");
check("evidence checklist names judge sandbox access", evidence.includes("slackhack@salesforce.com") && evidence.includes("testing@devpost.com"), "external gate");

placeholderOrPublicUrl("Public repository", "TODO_PUBLIC_REPO_URL");
placeholderOrPublicUrl("Demo video", "TODO_DEMO_VIDEO_URL", { video: true });
placeholderOrPublicUrl("Slack developer sandbox", "TODO_SLACK_SANDBOX_URL");
placeholderOrPublicUrl("Devpost project", "TODO_DEVPOST_PROJECT_URL");
check("safe URL setter command exists", typeof packageJson.scripts?.["submission:set-urls"] === "string", "final URL replacement");

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${item.detail.replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Devpost form check failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nDevpost form checks passed.");
  console.log("URL fields may remain TODO placeholders before final submission, or validated public URLs after `npm.cmd run submission:set-urls`.");
}
