/* ============================================================
 * ALZBOT API SERVER
 * HTTP bridge untuk website ↔ jadibot manager
 * ============================================================ */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {
  getAllJadibotSessions,
  getJadibotStatus,
  startJadibot,
  stopJadibot,
  restartJadibotSession,
  isJadibotActive,
} from './src/lib/rimuru-jadibot-manager.js';
import {
  updateSettings as persistUpdateSettings,
  getSettings as persistGetSettings,
} from './src/lib/user-bot-settings.js';
import { updateJadibotConfig } from './src/lib/jadibot-config.js';

const API_PORT = process.env.API_PORT || 2106;

/* ============================================================
 * STATE
 * ============================================================ */
const pairCache = new Map();
const qrCache = new Map();
const pendingStarts = new Set();

/* ============================================================
 * HELPERS
 * ============================================================ */
function getMainSock() {
  return global.sock || global.conn || global.client || global.rimuruSock || null;
}

function normalizeJid(input) {
  if (!input) return null;
  const s = String(input).trim().replace(/\D/g, '');
  if (!s) return null;
  return s + '@s.whatsapp.net';
}

function normalizeId(jid) {
  return String(jid || '').replace(/@.+/g, '');
}

function extractPairingCode(text) {
  if (!text || typeof text !== 'string') return null;

  const mdMatch = text.match(/```\s*([A-Z0-9]{4}-[A-Z0-9]{4})\s*```/);
  if (mdMatch) return mdMatch[1];

  const dashMatch = text.match(/\b([A-Z0-9]{4}-[A-Z0-9]{4})\b/);
  if (dashMatch) return dashMatch[1];

  const plainMatch = text.match(/\b([A-Z0-9]{8})\b/);
  if (plainMatch) return plainMatch[1];

  return null;
}

/* ============================================================
 * EXPRESS SETUP
 * ============================================================ */
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

/* ============================================================
 * ENDPOINTS
 * ============================================================ */

app.get('/api/health', (req, res) => {
  const sock = getMainSock();
  res.json({
    ok: true,
    service: 'alzbot-api',
    uptime: process.uptime(),
    mainBotReady: !!sock,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/sessions', (req, res) => {
  try {
    res.json({ sessions: getAllJadibotSessions() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * SESSION PAIRING
 * ============================================================ */
app.post('/api/session/pairing', async (req, res) => {
  try {
    const raw = req.body?.phone || req.body?.session_id;
    if (!raw) return res.status(400).json({ error: 'phone wajib diisi' });

    const userJid = normalizeJid(raw);
    if (!userJid) return res.status(400).json({ error: 'Format nomor tidak valid' });
    const sessionId = normalizeId(userJid);

    const sock = getMainSock();
    if (!sock) return res.status(503).json({ error: 'Main bot belum terhubung ke WhatsApp' });

    const st = getJadibotStatus(userJid);
    if (st && st.status === 'connected') {
      return res.json({
        status: 'connected',
        session_id: sessionId,
        message: 'Session sudah terhubung',
      });
    }

    if (pendingStarts.has(sessionId)) {
      return res.status(429).json({ error: 'Nomor ini sedang diproses. Tunggu...' });
    }

    pendingStarts.add(sessionId);

    const originalSend = sock.sendMessage.bind(sock);
    let capturedCode = null;

    sock.sendMessage = async (jid, content, opts) => {
      try {
        if (content?.text) {
          const code = extractPairingCode(content.text);
          if (code && /ᴘᴀɪʀɪɴɢ|pairing/i.test(content.text)) {
            capturedCode = code;
            console.log('[API] Pairing code captured:', code);
          }
        }
      } catch (e) { /* silent */ }
      return originalSend(jid, content, opts);
    };

    const mockM = {
      chat: userJid,
      sender: userJid,
      prefix: '.',
      key: { remoteJid: userJid, fromMe: false, id: 'web-' + Date.now() },
      reply: async () => {},
      react: async () => {},
    };

    startJadibot(sock, mockM, userJid, true).catch(e => {
      console.error('[API] startJadibot(pairing) error:', e.message);
    });

    const startWait = Date.now();
    while (!capturedCode && Date.now() - startWait < 25000) {
      await new Promise(r => setTimeout(r, 500));
    }

    sock.sendMessage = originalSend;
    pendingStarts.delete(sessionId);

    if (capturedCode) {
      pairCache.set(sessionId, { code: capturedCode, createdAt: Date.now() });
      return res.json({
        status: 'pending',
        mode: 'pairing',
        session_id: sessionId,
        jid: userJid,
        code: capturedCode,
      });
    }

    return res.status(504).json({
      error: 'Timeout menunggu pairing code dari WhatsApp. Coba lagi dalam beberapa menit.',
    });
  } catch (e) {
    console.error('[API] /session/pairing error:', e);
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * SESSION QR
 * ============================================================ */
app.post('/api/session/start', async (req, res) => {
  try {
    const raw = req.body?.phone || req.body?.session_id;
    if (!raw) return res.status(400).json({ error: 'phone wajib diisi' });

    const userJid = normalizeJid(raw);
    if (!userJid) return res.status(400).json({ error: 'Format nomor tidak valid' });
    const sessionId = normalizeId(userJid);

    const sock = getMainSock();
    if (!sock) return res.status(503).json({ error: 'Main bot belum terhubung' });

    if (pendingStarts.has(sessionId)) {
      return res.status(429).json({ error: 'Nomor ini sedang diproses' });
    }

    pendingStarts.add(sessionId);

    const originalSend = sock.sendMessage.bind(sock);
    let capturedQR = null;

    sock.sendMessage = async (jid, content, opts) => {
      try {
        if (content?.image && Buffer.isBuffer(content.image)) {
          capturedQR = content.image.toString('base64');
        }
      } catch (e) {}
      return originalSend(jid, content, opts);
    };

    const mockM = {
      chat: userJid,
      sender: userJid,
      prefix: '.',
      key: { remoteJid: userJid, fromMe: false, id: 'web-' + Date.now() },
      reply: async () => {},
      react: async () => {},
    };

    startJadibot(sock, mockM, userJid, false).catch(e => {
      console.error('[API] startJadibot(qr) error:', e.message);
    });

    const startWait = Date.now();
    while (!capturedQR && Date.now() - startWait < 20000) {
      await new Promise(r => setTimeout(r, 500));
    }

    sock.sendMessage = originalSend;
    pendingStarts.delete(sessionId);

    if (capturedQR) {
      const dataUrl = 'data:image/png;base64,' + capturedQR;
      qrCache.set(sessionId, { qr: dataUrl, createdAt: Date.now() });
      return res.json({
        status: 'pending',
        mode: 'qr',
        session_id: sessionId,
        jid: userJid,
        qr: dataUrl,
      });
    }

    return res.status(504).json({ error: 'Timeout menunggu QR' });
  } catch (e) {
    console.error('[API] /session/start error:', e);
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * SESSION STATUS
 * ============================================================ */
app.get('/api/session/status', (req, res) => {
  try {
    const raw = req.query.session_id || req.query.phone;
    if (!raw) return res.status(400).json({ error: 'session_id wajib' });

    const userJid = normalizeJid(raw);
    const sessionId = normalizeId(userJid);

    const st = getJadibotStatus(userJid);
    if (st) {
      return res.json({
        status: st.status === 'connected' ? 'connected' : 'pending',
        session_id: sessionId,
        jid: st.jid,
        uptime: st.uptime,
        phone: sessionId,
        source: 'memory',
      });
    }

    if (isJadibotActive(userJid)) {
      return res.json({ status: 'pending', session_id: sessionId, source: 'memory' });
    }

    const sessionPath = path.join(process.cwd(), 'session', 'jadibot', sessionId);
    const credsPath = path.join(sessionPath, 'creds.json');

    if (fs.existsSync(credsPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        if (creds.registered && creds.me && creds.me.id) {
          const phoneFromCreds = String(creds.me.id).split(':')[0].split('@')[0];
          return res.json({
            status: 'connected',
            session_id: sessionId,
            jid: creds.me.id,
            phone: phoneFromCreds || sessionId,
            source: 'disk',
          });
        }
      } catch (e) {}
    }

    return res.json({
      status: 'disconnected',
      session_id: sessionId,
      phone: sessionId,
      source: 'none',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * SESSION RESTART & LOGOUT
 * ============================================================ */
app.post('/api/session/restart', async (req, res) => {
  try {
    const raw = req.body?.session_id;
    if (!raw) return res.status(400).json({ error: 'session_id wajib' });

    const sessionId = normalizeId(raw);
    const sock = getMainSock();
    if (!sock) return res.status(503).json({ error: 'Main bot belum terhubung' });

    await restartJadibotSession(sock, sessionId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/session/logout', async (req, res) => {
  try {
    const raw = req.body?.session_id;
    if (!raw) return res.status(400).json({ error: 'session_id wajib' });

    const userJid = normalizeJid(raw);
    await stopJadibot(userJid, true);
    pairCache.delete(normalizeId(userJid));
    qrCache.delete(normalizeId(userJid));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * PLUGIN MANAGEMENT
 * ============================================================ */
app.post('/api/plugin/install', async (req, res) => {
  try {
    const { session_id, name, code } = req.body || {};
    if (!session_id || !name) {
      return res.status(400).json({ error: 'session_id & name wajib' });
    }

    const pluginsDir = path.join(process.cwd(), 'plugins');
    const userPluginDir = path.join(pluginsDir, 'custom_' + session_id);

    if (!fs.existsSync(userPluginDir)) {
      fs.mkdirSync(userPluginDir, { recursive: true });
    }

    const pluginPath = path.join(userPluginDir, name + '.js');
    fs.writeFileSync(pluginPath, code || '', 'utf8');

    try {
      const { hotReloadPlugin } = await import('./src/lib/rimuru-plugins.js');
      await hotReloadPlugin(pluginPath);
    } catch (e) {
      console.warn('[API] hot reload gagal:', e.message);
    }

    res.json({ ok: true, path: pluginPath });
  } catch (e) {
    console.error('[API] /plugin/install error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/plugin/delete', async (req, res) => {
  try {
    const { session_id, name } = req.body || {};
    if (!session_id || !name) {
      return res.status(400).json({ error: 'session_id & name wajib' });
    }

    const pluginPath = path.join(
      process.cwd(),
      'plugins',
      'custom_' + session_id,
      name + '.js'
    );

    if (fs.existsSync(pluginPath)) {
      fs.unlinkSync(pluginPath);
    }

    try {
      const { unloadPlugin } = await import('./src/lib/rimuru-plugins.js');
      unloadPlugin(name);
    } catch (e) {}

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * SETTINGS — persist + sync config file
 * ============================================================ */
app.post('/api/settings/apply', async (req, res) => {
  try {
    const s = req.body || {};
    if (!s.session_id) {
      return res.status(400).json({ error: 'session_id wajib' });
    }

    const updated = persistUpdateSettings(s.session_id, s);

    // ==== SYNC KE CONFIG FILE JADIBOT ====
    try {
      updateJadibotConfig(s.session_id, {
        botName: updated.bot_name,
        prefix: updated.prefix,
        mode: updated.mode,
        ownerNumber: updated.owner_number,
        antiLink: updated.anti_link,
        antiSpam: updated.anti_spam,
        antiCall: updated.anti_call,
        autoRead: updated.auto_read,
        autoTyping: updated.auto_typing,
        antiDelete: updated.anti_delete,
        welcomeMsg: updated.welcome_msg,
        goodbyeMsg: updated.goodbye_msg,
      });
      console.log('[API] Config file synced untuk', s.session_id);
    } catch (e) {
      console.warn('[API] Gagal sync config file:', e.message);
    }

    // ==== SIMPAN LOG KE SUPABASE (gak kirim WA) ====
    try {
      const SB_URL = process.env.SUPABASE_URL;
      const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
      if (SB_URL && SB_KEY) {
        await fetch(SB_URL + '/rest/v1/bot_settings_logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SB_KEY,
            Authorization: 'Bearer ' + SB_KEY,
          },
          body: JSON.stringify({
            user_id: s.user_id || null,
            session_id: s.session_id,
            action: 'update',
            changes: s,
          }),
        });
      }
    } catch (e) {
      console.warn('[API] Gagal simpan log:', e.message);
    }

    console.log('[API] Settings applied:', s.session_id, '| prefix:', updated.prefix);
    res.json({ ok: true, settings: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/settings/get', (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ error: 'session_id wajib' });
    const settings = persistGetSettings(sessionId) || {};
    res.json({ ok: true, settings });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/settings/logs', async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    const limit = parseInt(req.query.limit) || 20;
    if (!sessionId) return res.status(400).json({ error: 'session_id wajib' });

    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (!SB_URL || !SB_KEY) return res.json({ logs: [] });

    const url = `${SB_URL}/rest/v1/bot_settings_logs?session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.desc&limit=${limit}`;
    const r = await fetch(url, {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
    });
    const logs = await r.json();
    res.json({ ok: true, logs: Array.isArray(logs) ? logs : [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * BACKUP SESSION
 * ============================================================ */
app.post('/api/backup/create', async (req, res) => {
  try {
    const { session_id } = req.body || {};
    if (!session_id) return res.status(400).json({ error: 'session_id wajib' });

    const sessionPath = path.join(process.cwd(), 'session', 'jadibot', session_id);
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({ error: 'Session tidak ditemukan' });
    }

    const files = {};
    const readDir = (dir, base = '') => {
      for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        const rel = base ? path.join(base, f) : f;
        try {
          if (fs.statSync(full).isDirectory()) {
            readDir(full, rel);
          } else {
            files[rel] = fs.readFileSync(full, 'utf8');
          }
        } catch (e) {}
      }
    };
    readDir(sessionPath);

    res.json({
      ok: true,
      files,
      total: Object.keys(files).length,
      session_id,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/backup/restore', async (req, res) => {
  try {
    const { session_id, files } = req.body || {};
    if (!session_id || !files) {
      return res.status(400).json({ error: 'session_id & files wajib' });
    }

    const sessionPath = path.join(process.cwd(), 'session', 'jadibot', session_id);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    let count = 0;
    for (const [rel, content] of Object.entries(files)) {
      const target = path.join(sessionPath, rel);
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(target, content, 'utf8');
      count++;
    }

    res.json({ ok: true, restored: count, session_id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/backup/delete', async (req, res) => {
  try {
    const { session_id, name } = req.body || {};
    if (!session_id || !name) {
      return res.status(400).json({ error: 'session_id & name wajib' });
    }

    const backupPath = path.join(
      process.cwd(),
      'session',
      'backups',
      session_id,
      name
    );

    if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * NOTIF GROUP TEST
 * ============================================================ */
app.post('/api/notify/test', async (req, res) => {
  try {
    const { session_id, group_jid, message } = req.body || {};
    if (!session_id || !group_jid) {
      return res.status(400).json({ error: 'session_id & group_jid wajib' });
    }

    const sock = getMainSock();
    if (!sock) return res.status(503).json({ error: 'Bot belum siap' });

    try {
      await sock.sendMessage(group_jid, {
        text: message || '🔔 Test notifikasi dari AlzBot',
      });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: 'Gagal kirim ke grup: ' + e.message });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * BOT INFO
 * ============================================================ */
app.get('/api/bot/info', (req, res) => {
  try {
    const sock = getMainSock();
    res.json({
      ok: true,
      connected: !!sock,
      user: sock?.user?.id || null,
      name: sock?.user?.name || null,
      uptime: process.uptime(),
      sessions_active: getAllJadibotSessions().length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ============================================================
 * START SERVER
 * ============================================================ */
export function startApiServer() {
  app.listen(API_PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║       ALZBOT API SERVER — ONLINE           ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Port      : ${String(API_PORT).padEnd(30)}║`);
    console.log(`║  Health    : /api/health                   ║`);
    console.log(`║  Pairing   : POST /api/session/pairing     ║`);
    console.log(`║  QR        : POST /api/session/start       ║`);
    console.log(`║  Plugin    : POST /api/plugin/install      ║`);
    console.log(`║  Backup    : POST /api/backup/create       ║`);
    console.log(`║  Settings  : POST /api/settings/apply      ║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
  });
}

export default { startApiServer };