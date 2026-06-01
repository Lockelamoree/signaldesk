import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_DIR = "artifacts/private/brief-store";

function enabledFromEnv(env) {
  return String(env.SIGNALDESK_PERSIST_BRIEFS || "0").trim() === "1";
}

function safeId(id) {
  return String(id || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

export function createBriefStore({
  maxEntries = 50,
  persist = enabledFromEnv(process.env),
  directory = process.env.SIGNALDESK_BRIEF_STORE_DIR || DEFAULT_DIR
} = {}) {
  const memory = new Map();

  function filename(id) {
    const safe = safeId(id);
    return safe ? join(directory, `${safe}.json`) : "";
  }

  function pruneMemory() {
    while (memory.size > maxEntries) {
      const oldestId = memory.keys().next().value;
      memory.delete(oldestId);
    }
  }

  function pruneDisk() {
    if (!persist || !existsSync(directory)) return;
    const entries = readdirSync(directory)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const path = join(directory, name);
        return { path, mtimeMs: statSync(path).mtimeMs };
      })
      .sort((a, b) => b.mtimeMs - a.mtimeMs);

    for (const entry of entries.slice(maxEntries)) {
      unlinkSync(entry.path);
    }
  }

  function remember(brief) {
    if (!brief?.id) return false;

    memory.set(brief.id, brief);
    pruneMemory();

    if (!persist) return true;

    try {
      mkdirSync(directory, { recursive: true });
      writeFileSync(filename(brief.id), `${JSON.stringify({
        storedAt: new Date().toISOString(),
        evidenceBoundary: "Synthetic demo brief store. Do not persist real Slack incident data.",
        brief
      }, null, 2)}\n`);
      pruneDisk();
      return true;
    } catch {
      return false;
    }
  }

  function get(id) {
    if (!id) return undefined;
    const memoryBrief = memory.get(id);
    if (memoryBrief || !persist) return memoryBrief;

    try {
      const path = filename(id);
      if (!path || !existsSync(path)) return undefined;
      const parsed = JSON.parse(readFileSync(path, "utf8"));
      if (parsed?.brief?.id === id) {
        memory.set(id, parsed.brief);
        pruneMemory();
        return parsed.brief;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }

  return {
    enabled: persist,
    directory,
    remember,
    get
  };
}
