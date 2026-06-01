import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const strict = process.argv.includes("--strict");
const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

function git(args) {
  const result = spawnSync("git", args, {
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

function placeholderish(value) {
  return /(?:OWNER|REPO|TODO_|PLACEHOLDER|CHANGE_ME|YOUR-URL|YOUR_URL)/i.test(value);
}

function githubRemoteOk(value) {
  if (!value || placeholderish(value)) return false;
  return /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+(?:\.git)?$/i.test(value)
    || /^git@github\.com:[^/\s]+\/[^/\s]+\.git$/i.test(value);
}

function ignored(path) {
  return git(["check-ignore", "-q", "--", path]).ok;
}

const status = git(["status", "--porcelain"]).stdout;
const dirtyLines = status ? status.split(/\r?\n/).filter(Boolean) : [];
check("working tree is clean", dirtyLines.length === 0, dirtyLines.length ? `${dirtyLines.length} change(s)` : "clean");

const head = git(["rev-parse", "--verify", "HEAD"]);
check("repository has a commit", head.ok, head.ok ? head.stdout.slice(0, 12) : head.stderr || "missing HEAD");

const branch = git(["branch", "--show-current"]).stdout;
check("current branch is main", branch === "main" || !strict, branch || "missing");

const remotes = git(["remote"]).stdout.split(/\r?\n/).filter(Boolean);
const origin = git(["remote", "get-url", "origin"]);
if (origin.ok) {
  check("origin remote configured", true, origin.stdout);
  check("origin remote is GitHub-shaped", githubRemoteOk(origin.stdout), origin.stdout);
} else {
  check("origin remote configured", !strict, "missing; add public GitHub remote before final submission");
  check("origin remote is GitHub-shaped", !strict, "pending remote");
}

const upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
check("current branch has upstream", upstream.ok || !strict, upstream.ok ? upstream.stdout : "pending first push with -u");

check(".env is ignored", ignored(".env"), "secret hygiene");
check("private artifacts are ignored", ignored("artifacts/private/proof.json"), "secret-bearing artifacts");
check("submission artifacts are ignored", ignored("artifacts/submission/proof-pack.json"), "generated local bundle");
check("node_modules is ignored", ignored("node_modules/example.js"), "dependency tree");

const tracked = git(["ls-files"]).stdout.split(/\r?\n/).filter(Boolean);
const unsafeTracked = tracked.filter((file) =>
  file === ".env"
  || file.startsWith("node_modules/")
  || file.startsWith("artifacts/private/")
  || file.startsWith("artifacts/submission/")
);
check("no unsafe paths are tracked", unsafeTracked.length === 0, unsafeTracked.join(", ") || "clean");

const packageJson = JSON.parse(read("package.json") || "{}");
const verify = packageJson.scripts?.verify ?? "";
check("verify runs secret scan", verify.includes("scan:secrets"), "pre-push safety");
check("verify runs public repo check", verify.includes("repo:public:check"), "GitHub readiness");
check("strict final submission check exists", typeof packageJson.scripts?.["submission:final:online"] === "string", "public link reachability");

const settings = read("docs/github-repo-settings.md");
check("GitHub settings name default branch", settings.includes("Default branch: `main`"), "docs/github-repo-settings.md");
check("GitHub settings require private browser check", settings.includes("private/incognito"), "judge-view verification");

console.log(`GitHub launch check (${strict ? "strict" : "repo-safe"} mode)`);
console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.passed ? "PASS" : "FAIL"} | ${tableEscape(item.detail)} |`);
}

const failures = checks.filter((item) => !item.passed);
if (failures.length) {
  console.error(`GitHub launch check failed with ${failures.length} issue(s).`);
  if (!strict && remotes.length === 0) {
    console.error("Remote checks are pending until a public GitHub repository exists.");
  }
  process.exitCode = 1;
} else {
  console.log(strict
    ? "\nStrict GitHub launch checks passed. Re-open the public repository in a private/incognito browser before pasting it into Devpost."
    : "\nRepo-safe GitHub launch checks passed. Add a public GitHub origin and run `npm.cmd run github:launch:strict` after the first push.");
}
