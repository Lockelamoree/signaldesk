import { readFileSync, writeFileSync } from "node:fs";

const fields = [
  {
    key: "repo",
    label: "public repository",
    env: "SIGNALDESK_PUBLIC_REPO_URL",
    placeholder: "TODO_PUBLIC_REPO_URL"
  },
  {
    key: "video",
    label: "demo video",
    env: "SIGNALDESK_DEMO_VIDEO_URL",
    placeholder: "TODO_DEMO_VIDEO_URL",
    validate: allowedVideoHost
  },
  {
    key: "sandbox",
    label: "Slack developer sandbox",
    env: "SIGNALDESK_SLACK_SANDBOX_URL",
    placeholder: "TODO_SLACK_SANDBOX_URL"
  },
  {
    key: "devpost",
    label: "Devpost project",
    env: "SIGNALDESK_DEVPOST_PROJECT_URL",
    placeholder: "TODO_DEVPOST_PROJECT_URL",
    alsoReplace: ["TODO_DEVPOST_URL"],
    validate: devpostHost
  }
];

function usage() {
  return [
    "Usage:",
    "  npm.cmd run submission:set-urls -- --repo <url> --video <url> --sandbox <url> --devpost <url>",
    "",
    "Options:",
    "  --dry-run    Validate and show replacements without writing files.",
    "",
    "Environment variable alternatives:",
    ...fields.map((field) => `  ${field.env}`)
  ].join("\n");
}

function normalizeKey(key) {
  const aliases = {
    "public-repo": "repo",
    repository: "repo",
    "demo-video": "video",
    "slack-sandbox": "sandbox",
    "devpost-project": "devpost"
  };
  return aliases[key] ?? key;
}

function parseArgs(argv) {
  const parsed = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }

    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const option = arg.slice(2);
    const equals = option.indexOf("=");
    const rawKey = equals === -1 ? option : option.slice(0, equals);
    const inlineValue = equals === -1 ? undefined : option.slice(equals + 1);
    const key = normalizeKey(rawKey);
    if (!fields.some((field) => field.key === key)) {
      throw new Error(`Unknown option: --${rawKey}`);
    }

    const value = inlineValue ?? argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${rawKey}`);
    }

    parsed[key] = value;
    if (inlineValue === undefined) index += 1;
  }
  return parsed;
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

function devpostHost(value) {
  if (!publicHttpUrlOk(value)) return false;
  const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  return host === "devpost.com" || host.endsWith(".devpost.com");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceLineUrl(markdown, label, value) {
  const escapedLabel = escapeRegExp(label);
  const pattern = new RegExp(`(- ${escapedLabel}: )\`?[^\\n]+\`?`);
  if (!pattern.test(markdown)) {
    throw new Error(`Could not find URL field line for "${label}"`);
  }
  return markdown.replace(pattern, `$1\`${value}\``);
}

function replacePlainLineUrl(markdown, label, value) {
  const escapedLabel = escapeRegExp(label);
  const pattern = new RegExp(`(${escapedLabel}: )[^\\n]+`);
  if (!pattern.test(markdown)) {
    throw new Error(`Could not find line for "${label}"`);
  }
  return markdown.replace(pattern, `$1${value}`);
}

const args = parseArgs(process.argv.slice(2));
const replacements = new Map();
const failures = [];

for (const field of fields) {
  const value = String(args[field.key] ?? process.env[field.env] ?? "").trim();
  if (!value) {
    failures.push(`Missing ${field.label}; pass --${field.key} or set ${field.env}`);
    continue;
  }

  const validator = field.validate ?? publicHttpUrlOk;
  if (!validator(value)) {
    failures.push(`Invalid ${field.label} URL: ${value}`);
    continue;
  }

  replacements.set(field.placeholder, value);
  for (const placeholder of field.alsoReplace ?? []) {
    replacements.set(placeholder, value);
  }
}

if (failures.length) {
  console.error(usage());
  console.error("");
  for (const failure of failures) {
    console.error(`FAIL ${failure}`);
  }
  process.exit(1);
}

const devpostPath = "docs/devpost-form.md";
const videoPath = "docs/video-package.md";
let devpostForm = readFileSync(devpostPath, "utf8");
let videoPackage = readFileSync(videoPath, "utf8");

devpostForm = replaceLineUrl(devpostForm, "Public repository", replacements.get("TODO_PUBLIC_REPO_URL"));
devpostForm = replaceLineUrl(devpostForm, "Demo video", replacements.get("TODO_DEMO_VIDEO_URL"));
devpostForm = replaceLineUrl(devpostForm, "Slack developer sandbox", replacements.get("TODO_SLACK_SANDBOX_URL"));
devpostForm = replaceLineUrl(devpostForm, "Devpost project", replacements.get("TODO_DEVPOST_PROJECT_URL"));

videoPackage = replacePlainLineUrl(videoPackage, "Repository", replacements.get("TODO_PUBLIC_REPO_URL"));
videoPackage = replacePlainLineUrl(videoPackage, "Devpost", replacements.get("TODO_DEVPOST_URL"));

console.log("| Field | URL |");
console.log("| --- | --- |");
for (const field of fields) {
  console.log(`| ${field.label} | ${replacements.get(field.placeholder)} |`);
}

if (args.dryRun) {
  console.log("\nDry run passed. No files were changed.");
} else {
  writeFileSync(devpostPath, devpostForm);
  writeFileSync(videoPath, videoPackage);
  console.log("\nUpdated docs/devpost-form.md and docs/video-package.md.");
  console.log("Next: run `npm.cmd run submission:final:check`, then `npm.cmd run submission:final:online`.");
}
