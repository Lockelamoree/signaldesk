import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "coverage", "dist"]);
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(path);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js") && statSync(path).size < 1024 * 1024) {
      files.push(path);
    }
  }
}

walk(root);

const failures = [];
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    failures.push({
      file: relative(root, file),
      error: result.stderr || result.stdout
    });
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`Syntax check failed: ${failure.file}`);
    console.error(failure.error);
  }
  process.exitCode = 1;
} else {
  console.log(`Syntax check passed for ${files.length} JavaScript files.`);
}
