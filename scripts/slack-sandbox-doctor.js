import { existsSync, readFileSync } from "node:fs";

const strict = process.argv.includes("--strict");
const checks = [];

function check(name, passed, detail = "", required = true) {
  const status = passed ? "PASS" : required ? "FAIL" : "INFO";
  checks.push({ name, status, detail });
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    values[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
  return values;
}

function envValue(name) {
  return process.env[name] || envFile[name] || "";
}

function tokenDetail(value, expectedPrefix) {
  if (!value) return "not set";
  if (value.startsWith(expectedPrefix)) return `${expectedPrefix}... (${value.length} chars)`;
  return `unexpected prefix (${value.length} chars)`;
}

function redactedTokenCheck(name, expectedPrefix) {
  const value = envValue(name);
  const placeholder = value.includes("your-") || value.includes("redacted");
  const present = Boolean(value) && !placeholder;
  const prefixOk = present && value.startsWith(expectedPrefix);

  if (strict) {
    check(`${name} set with ${expectedPrefix} prefix`, prefixOk, tokenDetail(value, expectedPrefix));
    return;
  }

  check(
    `${name} format`,
    !value || placeholder || prefixOk,
    value ? tokenDetail(value, expectedPrefix) : "not set; run with --strict before live recording",
    false
  );
}

const envFile = readEnvFile(".env");
const envExample = readEnvFile(".env.example");
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

for (const key of ["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN", "SIGNALDESK_TRIAGE_MODE", "SIGNALDESK_PERSIST_BRIEFS", "SIGNALDESK_BRIEF_STORE_DIR", "PORT"]) {
  check(`.env.example includes ${key}`, key in envExample, "example configuration");
}

redactedTokenCheck("SLACK_BOT_TOKEN", "xoxb-");
redactedTokenCheck("SLACK_APP_TOKEN", "xapp-");

const mode = envValue("SIGNALDESK_TRIAGE_MODE") || envExample.SIGNALDESK_TRIAGE_MODE;
check("SIGNALDESK_TRIAGE_MODE is mcp", mode === "mcp", mode || "not set", strict);

const port = envValue("PORT") || envExample.PORT;
check("PORT is numeric", /^\d+$/.test(port), port || "not set");

const persistBriefs = envValue("SIGNALDESK_PERSIST_BRIEFS") || envExample.SIGNALDESK_PERSIST_BRIEFS || "0";
check("SIGNALDESK_PERSIST_BRIEFS is 0 or 1", ["0", "1"].includes(persistBriefs), persistBriefs);

const briefStoreDir = envValue("SIGNALDESK_BRIEF_STORE_DIR") || envExample.SIGNALDESK_BRIEF_STORE_DIR || "";
check(
  "brief store directory stays private",
  !briefStoreDir || briefStoreDir.startsWith("artifacts/private/"),
  briefStoreDir || "not set"
);

const botScopes = new Set(manifest.oauth_config?.scopes?.bot ?? []);
for (const scope of ["commands", "chat:write", "app_mentions:read", "channels:manage"]) {
  check(`manifest bot scope ${scope}`, botScopes.has(scope), "required for demo");
}

check("manifest enables App Home", manifest.features?.app_home?.home_tab_enabled === true, "judge onboarding surface");
check("manifest has /signaldesk command", manifest.features?.slash_commands?.some((command) => command.command === "/signaldesk"), "primary Slack UX");
check("manifest has message shortcut", manifest.features?.shortcuts?.some((shortcut) => shortcut.callback_id === "signaldesk_triage_message" && shortcut.type === "message"), "message triage UX");
check("manifest enables Socket Mode", manifest.settings?.socket_mode_enabled === true, "required for local app tokens");
check("manifest enables Interactivity", manifest.settings?.interactivity?.is_enabled === true, "required for buttons");
check("manifest subscribes to app home", manifest.settings?.event_subscriptions?.bot_events?.includes("app_home_opened"), "App Home onboarding");
check("manifest subscribes to app mentions", manifest.settings?.event_subscriptions?.bot_events?.includes("app_mention"), "mention flow");
check("verify includes Slack-to-MCP smoke", packageJson.scripts?.verify?.includes("smoke:slack-mcp"), "MCP-backed Slack proof");
check("start script exists", packageJson.scripts?.start === "node src/slack/app.js", packageJson.scripts?.start ?? "missing");

console.log(`Slack sandbox doctor (${strict ? "strict" : "repo-safe"} mode)`);
console.log("| Check | Result | Detail |");
console.log("| --- | --- | --- |");
for (const item of checks) {
  console.log(`| ${item.name} | ${item.status} | ${String(item.detail).replace(/\|/g, "/")} |`);
}

const failures = checks.filter((item) => item.status === "FAIL");
if (failures.length) {
  console.error(`Slack sandbox doctor failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else if (!strict) {
  console.log("\nRepo-safe sandbox checks passed. Run `npm.cmd run sandbox:doctor -- --strict` after setting real Slack tokens before recording.");
} else {
  console.log("\nStrict sandbox checks passed. Start the app with `npm.cmd run start` and test the message shortcut in Slack.");
}
