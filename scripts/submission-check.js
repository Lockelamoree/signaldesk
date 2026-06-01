import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "ARCHITECTURE.md",
  "LICENSE",
  "SECURITY.md",
  "manifest.json",
  "package.json",
  "package-lock.json",
  "docs/architecture.svg",
  "docs/devpost-copy.md",
  "docs/devpost-form.md",
  "docs/rules-compliance.md",
  "docs/judge-one-pager.md",
  "docs/judge-quickstart.md",
  "docs/impact-evaluation.md",
  "docs/judge-evidence-matrix.md",
  "docs/bonus-prize-map.md",
  "docs/slack-ux-proof.md",
  "docs/slack-interaction-transcript.md",
  "docs/slack-interaction-preview.html",
  "docs/mcp-tool-transcript.md",
  "docs/github-repo-settings.md",
  "docs/live-gate-handoff.md",
  "docs/demo-script.md",
  "docs/demo-captions.vtt",
  "docs/demo-transcript.md",
  "docs/demo-preview.html",
  "docs/demo-preview.png",
  "docs/recording-readiness.md",
  "docs/recording-take-card.md",
  "docs/thumbnail.svg",
  "docs/thumbnail.png",
  "docs/devpost-checklist.md",
  "docs/judge-review.md",
  "docs/judge-proof.md",
  "docs/sample-incident-report.md",
  "docs/slack-sandbox-runbook.md",
  "docs/validation-report.md",
  "docs/video-package.md",
  "scripts/github-launch-check.js",
  "scripts/devpost-paste-bundle.js",
  "scripts/live-gate-status.js",
  "scripts/set-submission-urls.js",
  "src/slack/app.js",
  "src/slack/actionPayloads.js",
  "src/slack/appHome.js",
  "src/slack/briefStore.js",
  "src/slack/commandInput.js",
  "src/slack/errorResponses.js",
  "src/mcp/server.js",
  "src/core/incidentBrief.js"
];

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

for (const file of requiredFiles) {
  check(`required file ${file}`, existsSync(file), "repo-local artifact");
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const readme = readFileSync("README.md", "utf8");
const devpostCopy = readFileSync("docs/devpost-copy.md", "utf8");
const judgeReview = readFileSync("docs/judge-review.md", "utf8");
const mcpServer = readFileSync("src/mcp/server.js", "utf8");

check("verify script exists", typeof packageJson.scripts?.verify === "string", packageJson.scripts?.verify ?? "");
check("secret scan in verify", packageJson.scripts?.verify?.includes("scan:secrets"), "pre-public-push gate");
check("syntax check in verify", packageJson.scripts?.verify?.includes("check:syntax"), "entrypoint parse gate");
check("Block Kit check in verify", packageJson.scripts?.verify?.includes("check:block-kit"), "Slack payload limit gate");
check("Slack UX proof in verify", packageJson.scripts?.verify?.includes("slack:ux:proof"), "App Home/modal proof gate");
check("Slack interaction proof in verify", packageJson.scripts?.verify?.includes("slack:interactions:proof"), "button workflow proof gate");
check("demo preview check in verify", packageJson.scripts?.verify?.includes("demo:preview:check"), "storyboard proof gate");
check("demo thumbnail check in verify", packageJson.scripts?.verify?.includes("demo:thumbnail:check"), "video packaging proof");
check("demo captions check in verify", packageJson.scripts?.verify?.includes("demo:captions:check"), "accessible video packaging proof");
check("Devpost form check in verify", packageJson.scripts?.verify?.includes("devpost:form:check"), "paste-ready submission proof");
check("rules compliance check in verify", packageJson.scripts?.verify?.includes("rules:check"), "official rules proof");
check("impact evaluation in verify", packageJson.scripts?.verify?.includes("impact:evaluate"), "Agent for Good impact proof");
check("recording readiness in verify", packageJson.scripts?.verify?.includes("recording:check"), "demo recording proof");
check("judge quickstart check in verify", packageJson.scripts?.verify?.includes("judge:quickstart:check"), "judge friction proof");
check("judge matrix check in verify", packageJson.scripts?.verify?.includes("judge:matrix:check"), "rubric evidence proof");
check("bonus prize check in verify", packageJson.scripts?.verify?.includes("prize:check"), "side-prize evidence proof");
check("Slack sandbox doctor in verify", packageJson.scripts?.verify?.includes("sandbox:doctor"), "live demo setup preflight");
check("MCP smoke in verify", packageJson.scripts?.verify?.includes("smoke:mcp"), "required technology proof");
check("MCP transcript in verify", packageJson.scripts?.verify?.includes("mcp:transcript"), "full MCP tool proof");
check("Slack MCP bridge in verify", packageJson.scripts?.verify?.includes("smoke:slack-mcp"), "Slack app can use MCP-backed triage");
check("fixture validation in verify", packageJson.scripts?.verify?.includes("validate:fixtures"), "scenario coverage proof");
check("public repo check in verify", packageJson.scripts?.verify?.includes("repo:public:check"), "public GitHub readiness");
check("live gate status in verify", packageJson.scripts?.verify?.includes("submission:live-gates"), "current external gate packet");
check("Devpost paste bundle in verify", packageJson.scripts?.verify?.includes("submission:bundle"), "paste-ready submission packet");
check("sample report command exists", typeof packageJson.scripts?.["report:sample"] === "string", "handoff artifact proof");
check("proof pack command exists", typeof packageJson.scripts?.["proof:pack"] === "string", "judge evidence packaging");
check("public repo check command exists", typeof packageJson.scripts?.["repo:public:check"] === "string", "GitHub launch safety");
check("GitHub launch check command exists", typeof packageJson.scripts?.["github:launch:check"] === "string", "public repo launch safety");
check("strict GitHub launch command exists", typeof packageJson.scripts?.["github:launch:strict"] === "string", "post-push public repo safety");
check("judge quickstart command exists", typeof packageJson.scripts?.["judge:quickstart:check"] === "string", "judge friction packaging");
check("judge matrix command exists", typeof packageJson.scripts?.["judge:matrix:check"] === "string", "rubric evidence packaging");
check("bonus prize command exists", typeof packageJson.scripts?.["prize:check"] === "string", "side-prize evidence packaging");
check("Slack UX proof command exists", typeof packageJson.scripts?.["slack:ux:proof"] === "string", "Best UX evidence packaging");
check("Slack interaction proof command exists", typeof packageJson.scripts?.["slack:interactions:proof"] === "string", "interactive workflow packaging");
check("rules compliance command exists", typeof packageJson.scripts?.["rules:check"] === "string", "official rules packaging");
check("MCP transcript command exists", typeof packageJson.scripts?.["mcp:transcript"] === "string", "Best Technological Implementation packaging");
check("impact evaluation command exists", typeof packageJson.scripts?.["impact:evaluate"] === "string", "Agent for Good impact packaging");
check("recording readiness command exists", typeof packageJson.scripts?.["recording:check"] === "string", "demo preflight packaging");
check("sandbox doctor command exists", typeof packageJson.scripts?.["sandbox:doctor"] === "string", "live demo preflight");
check("Devpost paste bundle command exists", typeof packageJson.scripts?.["submission:bundle"] === "string", "paste-ready submission packet");
check("live gate status command exists", typeof packageJson.scripts?.["submission:live-gates"] === "string", "external gate packet");
check("safe URL setter command exists", typeof packageJson.scripts?.["submission:set-urls"] === "string", "final URL replacement");
check("final submission check command exists", typeof packageJson.scripts?.["submission:final:check"] === "string", "strict external gate");
check("online final submission check command exists", typeof packageJson.scripts?.["submission:final:online"] === "string", "strict public link gate");
check("demo assets command exists", typeof packageJson.scripts?.["demo:assets"] === "string", "recording asset proof");
check("demo preview screenshot command exists", typeof packageJson.scripts?.["demo:preview:screenshot"] === "string", "visual proof generation");

const botScopes = new Set(manifest.oauth_config?.scopes?.bot ?? []);
for (const scope of ["app_mentions:read", "channels:manage", "chat:write", "commands"]) {
  check(`manifest includes ${scope}`, botScopes.has(scope), "Slack app scope");
}

check("manifest enables socket mode", manifest.settings?.socket_mode_enabled === true, "local demo transport");
check("manifest enables interactivity", manifest.settings?.interactivity?.is_enabled === true, "button handlers");
check("manifest enables App Home", manifest.features?.app_home?.home_tab_enabled === true, "judge onboarding surface");
check("manifest subscribes app_home_opened", manifest.settings?.event_subscriptions?.bot_events?.includes("app_home_opened"), "App Home onboarding");
check("manifest defines /signaldesk", manifest.features?.slash_commands?.some((command) => command.command === "/signaldesk"), "primary Slack UX");
check("manifest defines message shortcut", manifest.features?.shortcuts?.some((shortcut) => shortcut.callback_id === "signaldesk_triage_message" && shortcut.type === "message"), "message-level Slack UX");
const appHomeSource = readFileSync("src/slack/appHome.js", "utf8");
const slackAppSource = readFileSync("src/slack/app.js", "utf8");
const commandInputSource = readFileSync("src/slack/commandInput.js", "utf8");
check("Slack app has help payload", appHomeSource.includes("buildSignalDeskHelp"), "no-input judge guidance");
check("Slack app has App Home demo modal", appHomeSource.includes("buildHomeDemoGuideModal") && slackAppSource.includes("HOME_DEMO_GUIDE_ACTION"), "clickable judge guide");
check("Slack app has App Home proof modal", appHomeSource.includes("buildHomeProofChecklistModal") && slackAppSource.includes("HOME_PROOF_CHECKLIST_ACTION"), "clickable proof guide");
check("Slack app has slash proof payload", appHomeSource.includes("buildSignalDeskProof") && slackAppSource.includes("proofPayload"), "judge proof checklist");
check("Slack app has optional private brief store", existsSync("src/slack/briefStore.js") && slackAppSource.includes("createBriefStore"), "demo action recovery");
check("Slack app has short demo alias", commandInputSource.includes("DEMO_ALIASES"), "low-friction judge demo path");
check("Slack app has proof alias", commandInputSource.includes("PROOF_ALIASES"), "slash-command proof checklist");
check("Slack app has safe error payload", readFileSync("src/slack/errorResponses.js", "utf8").includes("buildTriageErrorPayload"), "live demo failure guidance");
check("README has judge test path", readme.includes("How Judges Can Test"), "judge friction reducer");
check("README links judge quickstart", readme.includes("docs/judge-quickstart.md"), "judge friction reducer");
check("README embeds demo preview screenshot", readme.includes("docs/demo-preview.png"), "judge-visible first screen");
check("README labels preview as storyboard", readme.includes("storyboard preview"), "evidence boundary");
check("README names GitHub launch gate", readme.includes("github:launch:check"), "public repo launch safety");
check("README names live account-gate handoff", readme.includes("docs/live-gate-handoff.md"), "Max-owned account gates");
check("README names safe final URL setter", readme.includes("submission:set-urls"), "final URL replacement");
check("README names Devpost paste bundle", readme.includes("submission:bundle"), "paste-ready submission packet");
check("README names live gate status", readme.includes("submission:live-gates"), "external gate packet");
check("README links judge one-pager", readme.includes("docs/judge-one-pager.md"), "30-second judge landing path");
check("README names proof command", readme.includes("/signaldesk proof"), "judge proof checklist");
check("Devpost copy names Agent for Good", devpostCopy.includes("Slack Agent for Good"), "track alignment");
check("Devpost copy names MCP", devpostCopy.includes("Model Context Protocol") || devpostCopy.includes("MCP"), "required tech alignment");
check("Devpost form exists", existsSync("docs/devpost-form.md"), "paste-ready fields");
check("Rules compliance map exists", existsSync("docs/rules-compliance.md") && readFileSync("docs/rules-compliance.md", "utf8").includes("Manual Final Attestations"), "official rules proof");
check("Judge one-pager maps rubric and boundary", existsSync("docs/judge-one-pager.md") && readFileSync("docs/judge-one-pager.md", "utf8").includes("Technological Implementation") && readFileSync("docs/judge-one-pager.md", "utf8").includes("Evidence Boundary"), "30-second judge landing path");
check("Judge quickstart exists", existsSync("docs/judge-quickstart.md") && readFileSync("docs/judge-quickstart.md", "utf8").includes("Live Slack Sandbox Proof"), "judge test path");
check("live handoff names required URLs", existsSync("docs/live-gate-handoff.md") && readFileSync("docs/live-gate-handoff.md", "utf8").includes("GitHub remote URL") && readFileSync("docs/live-gate-handoff.md", "utf8").includes("Slack sandbox URL"), "Max-owned account gates");
check("Impact evaluation records PASS", existsSync("docs/impact-evaluation.md") && readFileSync("docs/impact-evaluation.md", "utf8").includes("Overall result: **PASS**"), "Potential Impact proof");
check("Bonus prize map exists", existsSync("docs/bonus-prize-map.md") && readFileSync("docs/bonus-prize-map.md", "utf8").includes("Most Innovative Slack Agent"), "side-prize proof");
check("Slack UX proof exists", existsSync("docs/slack-ux-proof.md") && readFileSync("docs/slack-ux-proof.md", "utf8").includes("Proof Checklist Modal") && readFileSync("docs/slack-ux-proof.md", "utf8").includes("Slash Proof Checklist"), "Best UX proof");
check("Slack interaction transcript exists", existsSync("docs/slack-interaction-transcript.md") && readFileSync("docs/slack-interaction-transcript.md", "utf8").includes("Create channel"), "interactive workflow proof");
check("Slack interaction preview exists", existsSync("docs/slack-interaction-preview.html") && readFileSync("docs/slack-interaction-preview.html", "utf8").includes("Action Response Contact Sheet"), "interactive visual proof");
check("MCP tool transcript exists", existsSync("docs/mcp-tool-transcript.md") && readFileSync("docs/mcp-tool-transcript.md", "utf8").includes("list_demo_incidents"), "Best Technological Implementation proof");
check("Recording readiness records PASS", existsSync("docs/recording-readiness.md") && readFileSync("docs/recording-readiness.md", "utf8").includes("Overall result: **PASS**"), "demo proof preflight");
check("Recording take card exists", existsSync("docs/recording-take-card.md") && readFileSync("docs/recording-take-card.md", "utf8").includes("/signaldesk proof") && readFileSync("docs/recording-take-card.md", "utf8").includes("Runtime: MCP stdio"), "live recording operator card");
check("demo preview screenshot exists", existsSync("docs/demo-preview.png"), "judge-visible static screenshot");
check("MCP exposes detection plan", mcpServer.includes("build_detection_plan"), "security workflow depth");
check("MCP exposes impact summary", mcpServer.includes("build_impact_summary"), "Agent for Good impact proof");
check("Slack bridge names MCP mode", existsSync("src/slack/triageRuntime.js") && readFileSync("src/slack/triageRuntime.js", "utf8").includes("buildBriefViaMcp"), "required tech integration");
check("judge proof separates external gates", existsSync("docs/judge-proof.md") && readFileSync("docs/judge-proof.md", "utf8").includes("External Gates Still Required"), "evidence honesty");
check("judge review separates unproven gates", judgeReview.includes("Unproven:"), "evidence honesty");

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${item.detail.replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Submission readiness check failed with ${failures.length} repo-local issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nRepo-local submission readiness checks passed.");
  console.log("External gates still require live evidence: Slack sandbox install, judge invites, public repo URL, and demo video URL.");
}
