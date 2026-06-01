import { existsSync, readFileSync } from "node:fs";

const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function read(file) {
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function containsAll(text, terms) {
  return terms.every((term) => text.includes(term));
}

function parseTimestampSeconds(value) {
  const parts = value.split(":").map(Number);
  if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  }
  if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return Number.NaN;
}

function captionEndSeconds(captions) {
  const matches = [...captions.matchAll(/-->\s*(\d{2}:\d{2}(?::\d{2})?\.\d{3})/g)];
  if (!matches.length) return Number.NaN;
  const last = matches.at(-1)[1].replace(/\.\d+$/, "");
  return parseTimestampSeconds(last);
}

const compliance = read("docs/rules-compliance.md");
const devpostForm = read("docs/devpost-form.md");
const devpostCopy = read("docs/devpost-copy.md");
const videoPackage = read("docs/video-package.md");
const captions = read("docs/demo-captions.vtt");
const security = read("SECURITY.md");
const gitignore = read(".gitignore");
const packageJson = JSON.parse(read("package.json") || "{}");
const packageLock = read("package-lock.json");
const ci = read(".github/workflows/ci.yml");
const license = read("LICENSE");
const sandboxRunbook = read("docs/slack-sandbox-runbook.md");
const sourceText = [
  read("src/core/sampleIncidents.js"),
  read("docs/demo-script.md"),
  read("docs/demo-transcript.md"),
  read("docs/video-package.md"),
  read("docs/devpost-form.md")
].join("\n");

const dependencySpecs = Object.values(packageJson.dependencies ?? {});
const captionsEnd = captionEndSeconds(captions);

check("rules compliance map exists", Boolean(compliance), "docs/rules-compliance.md");
check("rules map names official deadline", compliance.includes("July 13, 2026 at 5:00 PM Pacific Time"), "submission period");
check("rules map covers pass/fail viability", compliance.includes("Stage One") && compliance.includes("pass/fail viability"), "rules gate");
check("rules map names all judging criteria", containsAll(compliance, [
  "Technological Implementation",
  "Design",
  "Potential Impact",
  "Quality of the Idea"
]), "official criteria");
check("rules map names required technology", containsAll(compliance, [
  "Slack AI capabilities",
  "MCP server integration",
  "Real-Time Search API"
]), "required technologies");
check("rules map covers required artifacts", containsAll(compliance, [
  "project track",
  "text description",
  "architecture diagram",
  "Slack developer sandbox URL",
  "slackhack@salesforce.com",
  "testing@devpost.com"
]), "submission artifacts");
check("rules map covers video restrictions", containsAll(compliance, [
  "less than three minutes",
  "working project",
  "YouTube",
  "Vimeo",
  "Facebook Video",
  "Youku",
  "sensitive information"
]), "demo video requirements");
check("rules map records manual attestations", containsAll(compliance, [
  "Max must confirm",
  "eligible",
  "employer",
  "unauthorized music",
  "private Slack data",
  "private/incognito"
]), "manual gate");
check("rules map has no TODO placeholders", !/TODO_/i.test(compliance), "judge-facing artifact");

check("track is Agent for Good", devpostForm.includes("Slack Agent for Good"), "docs/devpost-form.md");
check("impact is explained", containsAll(devpostForm + devpostCopy, ["nonprofits", "schools", "clinics", "first-response readiness"]), "Agent for Good");
check("architecture artifact exists", existsSync("docs/architecture.svg") && existsSync("ARCHITECTURE.md"), "architecture diagram");
check("sandbox instructions include judge emails", containsAll(devpostForm + sandboxRunbook, ["slackhack@salesforce.com", "testing@devpost.com"]), "judge access");
check("video package targets under 3 minutes", videoPackage.includes("Target length: 2:40-2:55"), "Devpost video length");
check("captions end before 180 seconds", Number.isFinite(captionsEnd) && captionsEnd < 180, `${captionsEnd || "unknown"} seconds`);
check("video package names allowed public host", containsAll(videoPackage, ["YouTube", "public or unlisted"]), "video host/visibility reminder");
check("video checklist forbids private data", containsAll(videoPackage, ["Hide tokens", "private user data", "Use synthetic demo data only"]), "sensitive-data control");
check("security policy forbids secrets and private data", containsAll(security, [
  "synthetic",
  "Slack tokens",
  "private workspace data",
  "scan:secrets"
]), "SECURITY.md");
check(".gitignore excludes local secrets", containsAll(gitignore, [".env", "artifacts/private/"]), ".gitignore");
check("optional brief store stays private", containsAll(read("README.md") + read(".env.example"), [
  "SIGNALDESK_PERSIST_BRIEFS",
  "artifacts/private/"
]), "private demo recovery");
check("secret scan script exists", typeof packageJson.scripts?.["scan:secrets"] === "string", "package.json");
check("CI installs without lifecycle scripts", ci.includes("npm ci --ignore-scripts"), ".github/workflows/ci.yml");
check("dependencies are pinned", dependencySpecs.length > 0 && dependencySpecs.every((spec) => /^\d+\.\d+\.\d+/.test(spec)), dependencySpecs.join(", "));
check("package lock exists", Boolean(packageLock), "package-lock.json");
check("MIT license exists", license.includes("MIT License") && license.includes("Copyright (c) 2026 Max"), "LICENSE");
check("sample/demo content uses synthetic/example indicators", containsAll(sourceText, [
  "example",
  "synthetic",
  "demo"
]), "no real incident evidence expected");
check("Salesforce/Slack security reporting path exists", security.includes("security@salesforce.com"), "vendor security issues");

console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${String(item.detail).replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`Rules compliance check failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nRules compliance checks passed.");
  console.log("Manual eligibility, ownership, employer-policy, final video, and final URL checks remain Max-owned before Devpost submission.");
}
