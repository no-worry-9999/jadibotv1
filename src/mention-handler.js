/* ============================================================
 * MENTION AUTO-REPLY
 * Ketika bot di-tag:
 *   1. Cek plugin match dari teks → jalankan plugin
 *   2. Kalau gak match → kirim ke AI (Gemini)
 * ============================================================ */

import { pluginStore } from "./lib/rimuru-plugins.js";
import { logger } from "./lib/rimuru-logger.js";

/* ============================================================
 * KONFIGURASI
 * ============================================================ */
const AI_API_KEY = process.env.GEMINI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "gemini-2.0-flash";
const AI_SYSTEM_PROMPT =
  process.env.AI_SYSTEM_PROMPT ||
  "Kamu adalah asisten bot WhatsApp yang ramah dan santai. Jawab singkat, maksimal 2-3 kalimat. Bahasa Indonesia casual, jangan kaku. Jangan pakai markdown, cukup teks biasa.";

/* ============================================================
 * DETEKSI MENTION
 * ============================================================ */
function isBotMentioned(msg, botJid) {
  try {
    const mentioned =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
      msg.message?.imageMessage?.contextInfo?.mentionedJid ||
      msg.message?.videoMessage?.contextInfo?.mentionedJid ||
      [];

    if (!mentioned.length) return false;

    const botNumber = String(botJid || "")
      .split(":")[0]
      .split("@")[0]
      .trim();

    if (!botNumber) return false;

    return mentioned.some((j) => {
      const num = String(j).split(":")[0].split("@")[0].trim();
      return num === botNumber;
    });
  } catch (e) {
    return false;
  }
}

/* ============================================================
 * EXTRACT QUESTION
 * ============================================================ */
function extractQuestion(msg) {
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    "";

  return String(text).replace(/@\d+/g, "").trim();
}

/* ============================================================
 * PLUGIN MATCHING
 * ============================================================ */
const TRIGGER_WORDS = [
  "buatin", "bikin", "buatkan", "buat", "tolong", "coba",
  "generate", "bikinin", "minta", "kasih", "kirim", "tolongin",
];

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findPluginMatch(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  const allPlugins = [];
  try {
    for (const [name, plugin] of pluginStore.commands) {
      if (!plugin?.config) continue;
      if (plugin.config.isEnabled === false) continue;

      const primary = String(name).toLowerCase();
      allPlugins.push({ plugin, name: primary, isPrimary: true });

      for (const alias of plugin.config.alias || []) {
        const a = String(alias).toLowerCase();
        if (a && a !== primary) {
          allPlugins.push({ plugin, name: a, isPrimary: false });
        }
      }
    }
  } catch (e) {
    logger.error("MENTION", "Gagal baca pluginStore: " + e.message);
    return null;
  }

  let best = null;
  let bestLen = 0;

  for (const item of allPlugins) {
    if (item.name.length < 3) continue;

    const regex = new RegExp(`\\b${escapeRegex(item.name)}\\b`, "i");
    if (regex.test(lower)) {
      if (item.name.length > bestLen) {
        best = { ...item, regex };
        bestLen = item.name.length;
      }
    }
  }

  if (!best) return null;

  let args = text.replace(best.regex, "").trim();

  const triggerPattern = new RegExp(
    `^(${TRIGGER_WORDS.map(escapeRegex).join("|")})\\s+`,
    "i"
  );
  args = args.replace(triggerPattern, "").trim();

  return {
    plugin: best.plugin,
    pluginName: best.plugin.config?.name || best.name,
    matchedName: best.name,
    args,
  };
}

/* ============================================================
 * AI CALL — Gemini
 * ============================================================ */
async function askAI(question) {
  if (!AI_API_KEY) {
    return "⚠️ AI belum aktif. Hubungi admin untuk setup `GEMINI_API_KEY`.";
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": AI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: AI_SYSTEM_PROMPT + "\n\nUser: " + question },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 250,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error("AI", `HTTP ${res.status}: ${errText.slice(0, 300)}`);
      return `❌ AI error ${res.status}. Coba lagi nanti.`;
    }

    const j = await res.json();
    const reply =
      j.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, aku gak bisa jawab sekarang.";
    return reply.trim();
  } catch (e) {
    logger.error("AI", e.message);
    return "❌ Gagal hubungi AI: " + e.message;
  }
}

/* ============================================================
 * MAIN HANDLER
 * ============================================================ */
export async function handleMention(msg, sock, options = {}) {
  try {
    if (!msg?.message) return false;
    if (msg.key?.fromMe) return false;
    if (msg.key?.remoteJid === "status@broadcast") return false;
    if (msg.key?.remoteJid === "broadcast") return false;

    const botJid = sock?.user?.id || "";
    if (!isBotMentioned(msg, botJid)) return false;

    const question = extractQuestion(msg);
    const chatId = msg.key?.remoteJid;
    const sender = msg.key?.participant || msg.key?.remoteJid || "-";

    logger.info("MENTION", `Dari ${sender}: "${question.slice(0, 100)}"`);

    if (!question) {
      await sock.sendMessage(
        chatId,
        { text: "Iya? Ada yang bisa aku bantu? 😊" },
        { quoted: msg }
      );
      return true;
    }

    // ==== 1. Coba match plugin ====
    const match = findPluginMatch(question);

    if (match) {
      logger.info(
        "MENTION",
        `Match plugin: ${match.pluginName} | args: "${match.args}"`
      );

      try {
        const fakeM = Object.assign(
          Object.create(Object.getPrototypeOf(msg)),
          msg,
          {
            text: match.args,
            args: match.args ? match.args.split(/\s+/) : [],
            query: match.args,
            body: match.args,
            command: match.matchedName,
          }
        );

        if (typeof match.plugin.handler === "function") {
          await match.plugin.handler(fakeM, {
            ...options,
            sock,
            isMention: true,
            mentionQuestion: question,
          });
          logger.info("MENTION", `Plugin ${match.pluginName} selesai`);
        } else {
          await sock.sendMessage(
            chatId,
            { text: `⚠️ Plugin *${match.pluginName}* tidak punya handler.` },
            { quoted: msg }
          );
        }
        return true;
      } catch (e) {
        logger.error("MENTION", `Plugin error (${match.pluginName}): ${e.message}`);
        if (e.stack) console.error(e.stack);

        await sock.sendMessage(
          chatId,
          { text: `❌ Gagal jalankan *${match.pluginName}*: ${e.message}` },
          { quoted: msg }
        );
        return true;
      }
    }

    // ==== 2. Gak match plugin → kirim ke AI ====
    logger.info("MENTION", "Tidak match plugin → kirim ke AI");

    try {
      await sock.sendPresenceUpdate("composing", chatId);
    } catch (e) { }

    const aiReply = await askAI(question);

    await sock.sendMessage(
      chatId,
      { text: aiReply },
      { quoted: msg }
    );

    logger.info("MENTION", `AI reply terkirim: "${aiReply.slice(0, 80)}"`);
    return true;
  } catch (e) {
    logger.error("MENTION", `Handler error: ${e.message}`);
    if (e.stack) console.error(e.stack);
    return false;
  }
}

/* ============================================================
 * EXPORT HELPER
 * ============================================================ */
export {
  isBotMentioned,
  extractQuestion,
  findPluginMatch,
  askAI,
};

export default { handleMention };