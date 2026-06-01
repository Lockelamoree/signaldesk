import { existsSync, readFileSync } from "node:fs";

const captionsPath = "docs/demo-captions.vtt";
const requiredTerms = [
  "Slack",
  "MCP stdio",
  "evidence IDs",
  "readiness",
  "Create channel",
  "detections",
  "under-resourced",
  "unsupported claims"
];

function parseTime(value) {
  const match = value.match(/^(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  const [, minutes, seconds, millis] = match;
  return Number(minutes) * 60_000 + Number(seconds) * 1_000 + Number(millis);
}

function parseCues(text) {
  const cuePattern = /^(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})$/gm;
  const cues = [];
  let match;

  while ((match = cuePattern.exec(text)) !== null) {
    cues.push({
      start: parseTime(match[1]),
      end: parseTime(match[2])
    });
  }

  return cues;
}

if (!existsSync(captionsPath)) {
  console.error(`${captionsPath} is missing.`);
  process.exit(1);
}

const captions = readFileSync(captionsPath, "utf8");
const cues = parseCues(captions);
const missingTerms = requiredTerms.filter((term) => !captions.includes(term));
const startsCorrectly = captions.startsWith("WEBVTT\n\n");
const ordered = cues.every((cue, index) => {
  const previous = cues[index - 1];
  return cue.start < cue.end && (!previous || cue.start >= previous.end);
});
const lastCue = cues.at(-1);
const underThreeMinutes = Boolean(lastCue && lastCue.end <= 180_000);

if (!startsCorrectly) {
  console.error("Captions must start with WEBVTT followed by a blank line.");
  process.exitCode = 1;
} else if (cues.length < 6) {
  console.error(`Expected at least 6 caption cues, found ${cues.length}.`);
  process.exitCode = 1;
} else if (!ordered) {
  console.error("Caption cues must be ordered and non-overlapping.");
  process.exitCode = 1;
} else if (!underThreeMinutes) {
  console.error(`Captions must fit under 3 minutes, last cue ends at ${lastCue?.end ?? 0} ms.`);
  process.exitCode = 1;
} else if (missingTerms.length) {
  console.error(`Captions are missing required proof terms: ${missingTerms.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Caption check passed. ${cues.length} cues end at ${(lastCue.end / 1000).toFixed(1)} seconds.`);
}
