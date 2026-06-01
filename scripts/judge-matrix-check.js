import { existsSync, readFileSync } from "node:fs";

const matrixPath = "docs/judge-evidence-matrix.md";
const requiredTerms = [
  "Technological Implementation",
  "Design",
  "Potential Impact",
  "Quality of the Idea",
  "Slack Agent for Good",
  "Runtime: MCP stdio",
  "triage_slack_alert",
  "build_impact_summary",
  "impact:evaluate",
  "judge:quickstart:check",
  "docs/judge-quickstart.md",
  "docs/impact-evaluation.md",
  "docs/rules-compliance.md",
  "npm.cmd run rules:check",
  "docs/slack-ux-proof.md",
  "docs/slack-interaction-transcript.md",
  "npm.cmd run slack:interactions:proof",
  "docs/mcp-tool-transcript.md",
  "recording:check",
  "docs/recording-readiness.md",
  "First-Response Readiness",
  "App Home",
  "Demo guide",
  "Proof checklist",
  "/signaldesk proof",
  "/signaldesk demo",
  "demo help",
  "runtime-check guidance",
  "npm.cmd run smoke:mcp",
  "npm.cmd run mcp:transcript",
  "npm.cmd run smoke:slack-mcp",
  "npm.cmd run submission:final:check",
  "npm.cmd run submission:final:online",
  "slackhack@salesforce.com",
  "testing@devpost.com",
  "Confirmed repo-local",
  "Pending live sandbox",
  "https://slackhack.devpost.com/",
  "https://info.devpost.com/customer-stories/salesforce-hackathons-on-devpost",
  "https://slack.devpost.com/project-gallery"
];

const requiredFiles = [
  "README.md",
  "ARCHITECTURE.md",
  "docs/architecture.svg",
  "docs/devpost-form.md",
  "docs/devpost-copy.md",
  "docs/judge-quickstart.md",
  "docs/impact-evaluation.md",
  "docs/rules-compliance.md",
  "docs/demo-captions.vtt",
  "docs/demo-script.md",
  "docs/demo-transcript.md",
  "docs/recording-readiness.md",
  "docs/judge-proof.md",
  "docs/thumbnail.png",
  "docs/mcp-tool-transcript.md",
  "docs/slack-interaction-transcript.md",
  "src/mcp/server.js",
  "src/slack/actionPayloads.js",
  "src/slack/commandInput.js",
  "src/slack/errorResponses.js",
  "src/slack/triageRuntime.js"
];

function tableRows(sectionName, markdown) {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`);
  const section = markdown.match(pattern)?.[1] ?? "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.includes("---"));
}

if (!existsSync(matrixPath)) {
  console.error(`${matrixPath} is missing.`);
  process.exit(1);
}

const matrix = readFileSync(matrixPath, "utf8");
const missingTerms = requiredTerms.filter((term) => !matrix.includes(term));
const missingFiles = requiredFiles.filter((file) => !existsSync(file));
const officialRows = tableRows("Official Criteria", matrix);
const artifactRows = tableRows("Required Submission Artifacts", matrix);
const benchmarkRows = tableRows("Winner Benchmark Signals", matrix);

if (missingTerms.length) {
  console.error(`Judge evidence matrix is missing required terms: ${missingTerms.join(", ")}`);
  process.exitCode = 1;
} else if (missingFiles.length) {
  console.error(`Judge evidence matrix references missing files: ${missingFiles.join(", ")}`);
  process.exitCode = 1;
} else if (officialRows.length < 5) {
  console.error(`Expected official criteria table plus at least 4 criteria rows, found ${officialRows.length} rows.`);
  process.exitCode = 1;
} else if (artifactRows.length < 10) {
  console.error(`Expected required artifact table plus at least 9 artifact rows, found ${artifactRows.length} rows.`);
  process.exitCode = 1;
} else if (benchmarkRows.length < 5) {
  console.error(`Expected benchmark table plus at least 4 benchmark rows, found ${benchmarkRows.length} rows.`);
  process.exitCode = 1;
} else {
  console.log("Judge evidence matrix check passed.");
}
