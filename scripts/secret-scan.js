import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "coverage", "dist"]);
const ignoredFiles = new Set(["package-lock.json"]);
const maxBytes = 1024 * 1024;

const patterns = [
  { name: "Slack bot token", regex: /xox[baprs]-[A-Za-z0-9-]{20,}/g },
  { name: "Slack app token", regex: /xapp-[A-Za-z0-9-]{20,}/g },
  { name: "OpenAI-style API key", regex: /sk-[A-Za-z0-9][A-Za-z0-9_-]{20,}/g },
  { name: "AWS access key", regex: /AKIA[0-9A-Z]{16}/g },
  { name: "Private key", regex: /BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY/g }
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(join(dir, entry.name), files);
      }
      continue;
    }
    if (!entry.isFile()) continue;
    const path = join(dir, entry.name);
    const rel = relative(root, path);
    if (ignoredFiles.has(entry.name)) continue;
    if (statSync(path).size > maxBytes) continue;
    files.push(path);
  }
  return files;
}

const findings = [];

for (const file of walk(root)) {
  const rel = relative(root, file);
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);

  for (const pattern of patterns) {
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
      const line = lines[lineNumber];
      pattern.regex.lastIndex = 0;
      const matches = line.match(pattern.regex) ?? [];
      for (const match of matches) {
        if (match.includes("your-token") || match.includes("your-bot-token") || match.includes("your-app-token")) {
          continue;
        }
        findings.push({
          file: rel,
          line: lineNumber + 1,
          type: pattern.name,
          preview: `${match.slice(0, 8)}...`
        });
      }
    }
  }
}

if (findings.length) {
  console.error("High-confidence secret patterns found:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.type} ${finding.preview}`);
  }
  process.exitCode = 1;
} else {
  console.log("No high-confidence secret patterns found.");
}
