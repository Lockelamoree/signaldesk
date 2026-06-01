import { existsSync, readFileSync, statSync } from "node:fs";

const svg = readFileSync("docs/thumbnail.svg", "utf8");
const pngPath = "docs/thumbnail.png";

const required = [
  'width="1280"',
  'height="720"',
  "SignalDesk",
  "MCP-backed security triage in Slack",
  "Runtime: MCP stdio",
  "SignalDesk: HIGH triage",
  "EV-001..004",
  "DET-001..005",
  "Create channel",
  "Readiness 100/100",
  "Slack Agent for Good"
];

const missing = required.filter((text) => !svg.includes(text));
const nonAscii = [...svg].filter((char) => char.charCodeAt(0) > 127);
const pngExists = existsSync(pngPath);

function validatePng(path) {
  const bytes = readFileSync(path);
  const signature = bytes.subarray(0, 8).toString("hex");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const size = statSync(path).size;

  return {
    signatureOk: signature === "89504e470d0a1a0a",
    width,
    height,
    size,
    sizeOk: size > 0 && size <= 2 * 1024 * 1024
  };
}

if (missing.length) {
  console.error(`Thumbnail is missing required text: ${missing.join(", ")}`);
  process.exitCode = 1;
} else if (nonAscii.length) {
  console.error("Thumbnail contains non-ASCII characters.");
  process.exitCode = 1;
} else if (!pngExists) {
  console.error("Upload-ready thumbnail PNG is missing at docs/thumbnail.png.");
  process.exitCode = 1;
} else {
  const png = validatePng(pngPath);
  if (!png.signatureOk) {
    console.error("docs/thumbnail.png is not a valid PNG file.");
    process.exitCode = 1;
  } else if (png.width !== 1280 || png.height !== 720) {
    console.error(`docs/thumbnail.png must be 1280x720, found ${png.width}x${png.height}.`);
    process.exitCode = 1;
  } else if (!png.sizeOk) {
    console.error(`docs/thumbnail.png must be under 2MB, found ${png.size} bytes.`);
    process.exitCode = 1;
  } else {
    console.log(`Thumbnail check passed. SVG source and 1280x720 PNG (${png.size} bytes) are ready.`);
  }
}
