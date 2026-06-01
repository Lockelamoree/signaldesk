import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const html = readFileSync("docs/demo-preview.html", "utf8");
const screenshotPath = "docs/demo-preview.png";

const required = [
  "SignalDesk: HIGH triage",
  "MCP stdio",
  "Create channel",
  "Evidence IDs",
  "Claim Audit",
  "Detection Checks",
  "First-Response Readiness",
  "build_impact_summary",
  "build_detection_plan",
  "generate_incident_report",
  "Triage with SignalDesk",
  "synthetic demo data",
  "storyboard preview"
];

const missing = required.filter((text) => !html.includes(text));
const findings = [];
const warnings = [];

function validateStaticHtml() {
  const idMatches = [...html.matchAll(/\sid=(["'])(.*?)\1/gi)].map((match) => match[2]);
  const idCounts = new Map();
  for (const id of idMatches) {
    idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }
  for (const [id, count] of idCounts.entries()) {
    if (count > 1) findings.push(`Duplicate id "${id}" appears ${count} times.`);
  }

  const resourceRegex = /\s(?:href|src|action)=("|')(.*?)\1/gi;
  for (const match of html.matchAll(resourceRegex)) {
    const value = match[2].trim();
    const clean = value.split("#")[0].split("?")[0];
    if (!clean || clean === "#" || clean.startsWith("#") || /^(https?:)?\/\//i.test(clean) || /^(mailto|tel|data|blob):/i.test(clean)) {
      continue;
    }
    if (clean.includes("../")) {
      warnings.push(`Relative parent-path link may break on clean URLs: ${clean}`);
    }
    const target = clean.startsWith("/")
      ? path.resolve(".", `.${clean}`)
      : path.resolve("docs", clean);
    if (!existsSync(target)) {
      findings.push(`Missing local resource target: ${clean}`);
    }
  }

  const ariaControlsRegex = /\saria-controls=(["'])(.*?)\1/gi;
  for (const match of html.matchAll(ariaControlsRegex)) {
    const targetId = match[2].trim();
    if (targetId && !idCounts.has(targetId)) {
      findings.push(`aria-controls references missing id: ${targetId}`);
    }
  }
}

function validateScreenshot() {
  if (!existsSync(screenshotPath)) {
    findings.push(`${screenshotPath} is missing. Run scripts/export-demo-preview-screenshot.ps1 on Windows.`);
    return;
  }

  const bytes = readFileSync(screenshotPath);
  const signature = bytes.subarray(0, 8).toString("hex");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const size = statSync(screenshotPath).size;

  if (signature !== "89504e470d0a1a0a") {
    findings.push(`${screenshotPath} is not a valid PNG file.`);
  }
  if (width !== 1440 || height !== 1000) {
    findings.push(`${screenshotPath} must be 1440x1000, found ${width}x${height}.`);
  }
  if (size <= 10_000) {
    findings.push(`${screenshotPath} is unexpectedly small (${size} bytes).`);
  }
}

validateStaticHtml();
validateScreenshot();

if (missing.length) {
  console.error(`Demo preview is missing required text: ${missing.join(", ")}`);
  process.exitCode = 1;
} else if (findings.length) {
  for (const finding of findings) console.error(`Demo preview finding: ${finding}`);
  process.exitCode = 1;
} else {
  for (const warning of warnings) console.warn(`Demo preview warning: ${warning}`);
  console.log("Demo preview check passed. HTML smoke checks and screenshot artifact are ready.");
}
