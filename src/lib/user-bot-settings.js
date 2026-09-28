/* ============================================================
 * USER BOT SETTINGS — Persist settings per jadibot session
 * Simpan ke disk + sync dari Supabase saat boot
 * ============================================================ */

import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "user-bot-settings.json");
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

let cache = {};

function ensureDir() {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadFromDisk() {
  try {
    ensureDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      cache = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")) || {};
      console.log(`[UserSettings] Loaded ${Object.keys(cache).length} dari disk`);
    }
  } catch (e) {
    console.error("[UserSettings] Disk load error:", e.message);
    cache = {};
  }
  return cache;
}

export function saveToDisk() {
  try {
    ensureDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(cache, null, 2), "utf8");
  } catch (e) {
    console.error("[UserSettings] Disk save error:", e.message);
  }
}

export async function loadFromSupabase() {
  if (!SB_URL || !SB_KEY) {
    console.warn("[UserSettings] Supabase env kosong, skip fetch");
    return cache;
  }
  try {
    const res = await fetch(SB_URL + "/rest/v1/bot_settings?select=*", {
      headers: {
        apikey: SB_KEY,
        Authorization: "Bearer " + SB_KEY,
      },
    });
    if (!res.ok) {
      console.error("[UserSettings] Supabase fetch error:", res.status);
      return cache;
    }
    const rows = await res.json();
    for (const row of rows) {
      if (!row.session_id) continue;
      cache[row.session_id] = {
        bot_name: row.bot_name,
        prefix: row.prefix,
        mode: row.mode,
        owner_number: row.owner_number,
        anti_link: row.anti_link,
        anti_spam: row.anti_spam,
        anti_call: row.anti_call,
        auto_read: row.auto_read,
        auto_typing: row.auto_typing,
        anti_delete: row.anti_delete,
        welcome_msg: row.welcome_msg,
        goodbye_msg: row.goodbye_msg,
        config_json: row.config_json,
        updated_at: row.updated_at,
      };
    }
    saveToDisk();
    console.log(`[UserSettings] Loaded ${rows.length} settings dari Supabase`);
  } catch (e) {
    console.error("[UserSettings] Supabase fetch error:", e.message);
  }
  return cache;
}

export function getSettings(sessionId) {
  if (!sessionId) return null;
  const id = String(sessionId).replace(/@.+/g, "").replace(/\D/g, "");
  return cache[id] || cache[sessionId] || null;
}

export function updateSettings(sessionId, patch) {
  if (!cache[sessionId]) cache[sessionId] = {};
  Object.assign(cache[sessionId], patch);
  cache[sessionId].updated_at = new Date().toISOString();
  saveToDisk();

  if (!global.userBotSettings) global.userBotSettings = {};
  global.userBotSettings[sessionId] = cache[sessionId];

  return cache[sessionId];
}

export function getAllSettings() {
  return cache;
}

export function deleteSettings(sessionId) {
  delete cache[sessionId];
  if (global.userBotSettings) delete global.userBotSettings[sessionId];
  saveToDisk();
}

export async function initUserSettings() {
  loadFromDisk();
  global.userBotSettings = cache;
  await loadFromSupabase();
  return cache;
}

export default {
  loadFromDisk,
  saveToDisk,
  loadFromSupabase,
  getSettings,
  updateSettings,
  getAllSettings,
  deleteSettings,
  initUserSettings,
};