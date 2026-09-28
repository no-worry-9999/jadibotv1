/* ============================================================
 * JADIBOT CONFIG — Per-session config file
 * ============================================================ */

import fs from "fs";
import path from "path";

const JADIBOT_DIR = path.join(process.cwd(), "session", "jadibot");
const cache = new Map();

const ALLOWED_KEYS = [
  "botName",
  "prefix",
  "mode",
  "ownerNumber",
  "antiLink",
  "antiSpam",
  "antiCall",
  "autoRead",
  "autoTyping",
  "antiDelete",
  "welcomeMsg",
  "goodbyeMsg",
];

function getConfigPath(sessionId) {
  return path.join(JADIBOT_DIR, sessionId, "config.json");
}

export function loadConfigFromDisk(sessionId) {
  try {
    const p = getConfigPath(sessionId);
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      cache.set(sessionId, data);
      return data;
    }
  } catch (e) {
    console.error("[JadibotConfig] Load error:", e.message);
  }
  return {};
}

export function saveConfigToDisk(sessionId, config) {
  try {
    const p = getConfigPath(sessionId);
    if (!fs.existsSync(path.dirname(p))) {
      fs.mkdirSync(path.dirname(p), { recursive: true });
    }
    fs.writeFileSync(p, JSON.stringify(config, null, 2), "utf8");
    cache.set(sessionId, config);
    return true;
  } catch (e) {
    console.error("[JadibotConfig] Save error:", e.message);
    return false;
  }
}

export function getJadibotConfig(sessionId) {
  if (cache.has(sessionId)) return cache.get(sessionId);
  return loadConfigFromDisk(sessionId);
}

export function updateJadibotConfig(sessionId, patch) {
  const cur = getJadibotConfig(sessionId) || {};
  const next = { ...cur };
  for (const [k, v] of Object.entries(patch)) {
    if (ALLOWED_KEYS.includes(k)) next[k] = v;
  }
  saveConfigToDisk(sessionId, next);
  return next;
}

export function deleteJadibotConfig(sessionId) {
  cache.delete(sessionId);
  try {
    const p = getConfigPath(sessionId);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {}
}

export { ALLOWED_KEYS };
export default {
  getJadibotConfig,
  updateJadibotConfig,
  deleteJadibotConfig,
  ALLOWED_KEYS,
};