import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const generatedAt = new Date().toISOString();
const outDir = "artifacts/submission";
const checks = [];

function read(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

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

function plainLine(markdown, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedLabel}:\\s*(.+)$`, "m");
  return markdown.match(pattern)?.[1].trim() ?? "";
}

function firstParagraph(markdown) {
  return markdown.split(/\n\s*\n/)[0]?.trim() ?? "";
}

function tableEscape(value) {
  return String(value).replace(/\|/g, "/").replace(/\n/g, " ");
}

function pendingUrl(value) {
  return !value || value.includes("TODO_");
}

const devpostForm = read("docs/devpost-form.md");
const devpostCopy = read("docs/devpost-copy.md");
const videoPackage = read("docs/video-package.md");
const rulesCompliance = read("docs/rules-compliance.md");
const impactEvaluation = read("docs/impact-evaluation.md");
const recordingReadiness = read("docs/recording-readiness.md");
const judgeProof = read("docs/judge-proof.md");
const packageJson = JSON.parse(read("package.json") || "{}");

const urls = {
  publicRepository: urlFromLine(devpostForm, "Public repository"),
  demoVideo: urlFromLine(devpostForm, "Demo video"),
  slackSandbox: urlFromLine(devpostForm, "Slack developer sandbox"),
  devpostProject: urlFromLine(devpostForm, "Devpost project")
};

const project = {
  name: section(devpostForm, "Project Name"),
  elevatorPitch: section(devpostForm, "Elevator Pitch"),
  tagline: section(devpostCopy, "Tagline"),
  track: section(devpostForm, "Track"),
  builtWith: section(devpostForm, "Built With"),
  urls
};

const story = {
  inspiration: section(devpostForm, "Inspiration"),
  whatItDoes: section(devpostForm, "What It Does"),
  howWeBuiltIt: section(devpostForm, "How We Built It"),
  challenges: section(devpostForm, "Challenges"),
  accomplishments: section(devpostForm, "Accomplishments"),
  whatWeLearned: section(devpostForm, "What We Learned"),
  whatsNext: section(devpostForm, "What's Next")
};

const video = {
  title: section(videoPackage, "Title"),
  description: section(videoPackage, "YouTube Description"),
  repositoryLine: plainLine(videoPackage, "Repository"),
  devpostLine: plainLine(videoPackage, "Devpost"),
  captions: "docs/demo-captions.vtt",
  thumbnail: "docs/thumbnail.png",
  shotOrder: section(videoPackage, "Shot Order")
};

const evidenceArtifacts = [
  ["Architecture diagram", "docs/architecture.svg"],
  ["Demo thumbnail PNG", "docs/thumbnail.png"],
  ["Demo captions", "docs/demo-captions.vtt"],
  ["Rules compliance map", "docs/rules-compliance.md"],
  ["Judge quickstart", "docs/judge-quickstart.md"],
  ["Judge proof pack", "docs/judge-proof.md"],
  ["Judge evidence matrix", "docs/judge-evidence-matrix.md"],
  ["Bonus prize map", "docs/bonus-prize-map.md"],
  ["Slack UX proof", "docs/slack-ux-proof.md"],
  ["Slack interaction transcript", "docs/slack-interaction-transcript.md"],
  ["MCP tool transcript", "docs/mcp-tool-transcript.md"],
  ["Impact evaluation", "docs/impact-evaluation.md"],
  ["Recording readiness", "docs/recording-readiness.md"],
  ["Sandbox runbook", "docs/slack-sandbox-runbook.md"]
].map(([label, path]) => ({ label, path, exists: existsSync(path) }));

const externalGates = [
  { label: "Public repository URL", value: urls.publicRepository, status: pendingUrl(urls.publicRepository) ? "PENDING" : "READY" },
  { label: "Public demo video URL", value: urls.demoVideo, status: pendingUrl(urls.demoVideo) ? "PENDING" : "READY" },
  { label: "Slack developer sandbox URL", value: urls.slackSandbox, status: pendingUrl(urls.slackSandbox) ? "PENDING" : "READY" },
  { label: "Devpost project URL", value: urls.devpostProject, status: pendingUrl(urls.devpostProject) ? "PENDING" : "READY" },
  { label: "Judge sandbox access", value: "slackhack@salesforce.com and testing@devpost.com invited as full members", status: "MANUAL" },
  { label: "Strict Slack token check", value: "npm.cmd run sandbox:doctor -- --strict", status: "MANUAL" },
  { label: "Final public link check", value: "npm.cmd run submission:final:online", status: "MANUAL" }
];

check("project name", project.name === "SignalDesk", project.name);
check("elevator pitch <= 200 chars", project.elevatorPitch.length > 0 && project.elevatorPitch.length <= 200, `${project.elevatorPitch.length} chars`);
check("track", project.track === "Slack Agent for Good", project.track);
check("built-with names Slack", project.builtWith.includes("Slack"), "required technology");
check("built-with names MCP", project.builtWith.includes("Model Context Protocol"), "required technology");
check("video title present", video.title.length > 0, video.title);
check("video description names track", video.description.includes("Slack Agent for Good"), "video metadata");
check("rules compliance generated", rulesCompliance.includes("Manual Final Attestations"), "official rules map");
check("impact evaluation passed", impactEvaluation.includes("Overall result: **PASS**"), "impact proof");
check("recording readiness passed", recordingReadiness.includes("Overall result: **PASS**"), "recording proof");
check("judge proof passed", judgeProof.includes("Overall result: **PASS**"), "judge proof");
check("safe URL setter command exists", typeof packageJson.scripts?.["submission:set-urls"] === "string", "final URL replacement");

for (const artifact of evidenceArtifacts) {
  check(`artifact exists: ${artifact.path}`, artifact.exists, artifact.label);
}

function formatMarkdown(bundle) {
  const artifactRows = bundle.evidenceArtifacts.map((artifact) =>
    `| ${tableEscape(artifact.label)} | ${artifact.exists ? "READY" : "MISSING"} | \`${tableEscape(artifact.path)}\` |`
  );
  const gateRows = bundle.externalGates.map((gate) =>
    `| ${tableEscape(gate.label)} | ${gate.status} | ${tableEscape(gate.value)} |`
  );

  return [
    "# SignalDesk Devpost Paste Bundle",
    "",
    `Generated: ${bundle.generatedAt}`,
    "",
    "This bundle is generated by `npm.cmd run submission:bundle`. It is a paste-ready operator packet for Devpost and video upload. It does not replace the live Slack sandbox, public video, or final public-link checks.",
    "",
    "## Project Fields",
    "",
    `Project name: ${bundle.project.name}`,
    "",
    `Elevator pitch (${bundle.project.elevatorPitch.length}/200 chars): ${bundle.project.elevatorPitch}`,
    "",
    `Track: ${bundle.project.track}`,
    "",
    "Built with:",
    "",
    bundle.project.builtWith,
    "",
    "## URL Fields",
    "",
    `- Public repository: ${bundle.project.urls.publicRepository}`,
    `- Demo video: ${bundle.project.urls.demoVideo}`,
    `- Slack developer sandbox: ${bundle.project.urls.slackSandbox}`,
    `- Devpost project: ${bundle.project.urls.devpostProject}`,
    "",
    "## Story Copy",
    "",
    "### Inspiration",
    "",
    bundle.story.inspiration,
    "",
    "### What It Does",
    "",
    bundle.story.whatItDoes,
    "",
    "### How We Built It",
    "",
    bundle.story.howWeBuiltIt,
    "",
    "### Challenges",
    "",
    bundle.story.challenges,
    "",
    "### Accomplishments",
    "",
    bundle.story.accomplishments,
    "",
    "### What We Learned",
    "",
    bundle.story.whatWeLearned,
    "",
    "### What's Next",
    "",
    bundle.story.whatsNext,
    "",
    "## Video Upload Fields",
    "",
    `Title: ${bundle.video.title}`,
    "",
    "Description:",
    "",
    bundle.video.description,
    "",
    `Thumbnail: ${bundle.video.thumbnail}`,
    "",
    `Captions: ${bundle.video.captions}`,
    "",
    "First sentence for social/preview:",
    "",
    firstParagraph(bundle.video.description),
    "",
    "## Evidence Artifacts",
    "",
    "| Artifact | Status | Path |",
    "| --- | --- | --- |",
    ...artifactRows,
    "",
    "## External Gates",
    "",
    "| Gate | Status | Value |",
    "| --- | --- | --- |",
    ...gateRows,
    "",
    "## Verification Commands",
    "",
    "```powershell",
    "npm.cmd run verify",
    "npm.cmd run proof:pack",
    "npm.cmd run recording:check",
    "npm.cmd run sandbox:doctor -- --strict",
    "npm.cmd run submission:final:check",
    "npm.cmd run submission:final:online",
    "```",
    "",
    "## Bundle Checks",
    "",
    "| Check | Result | Detail |",
    "| --- | --- | --- |",
    ...bundle.checks.map((item) => `| ${tableEscape(item.name)} | ${item.passed ? "PASS" : "FAIL"} | ${tableEscape(item.detail)} |`),
    ""
  ].join("\n");
}

const bundle = {
  generatedAt,
  project,
  story,
  video,
  evidenceArtifacts,
  externalGates,
  checks
};

mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/devpost-paste-bundle.json`, `${JSON.stringify(bundle, null, 2)}\n`);
writeFileSync(`${outDir}/devpost-paste-bundle.md`, formatMarkdown(bundle));

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${tableEscape(item.detail)} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Devpost paste bundle failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nDevpost paste bundle written to artifacts/submission/devpost-paste-bundle.md and artifacts/submission/devpost-paste-bundle.json.");
  console.log("URL fields remain pending until `npm.cmd run submission:set-urls` is run with the real public URLs.");
}
