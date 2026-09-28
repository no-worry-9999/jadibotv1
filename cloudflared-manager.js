/* ============================================================
 * CLOUDFLARE TUNNEL MANAGER
 * Auto download + spawn cloudflared untuk public HTTPS URL
 * + Auto push URL ke Supabase (system_config)
 * ============================================================ */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BIN_PATH = path.join(process.cwd(), 'cloudflared');
const BIN_URL = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64';
const TARGET_PORT = process.env.API_PORT || 2106;

let tunnelUrl = null;
let cfProcess = null;

function log(...args) {
  console.log('[CF]', ...args);
}

/* ============================================================
 * DOWNLOAD BINARY JIKA BELUM ADA
 * ============================================================ */
async function ensureBinary() {
  if (fs.existsSync(BIN_PATH)) {
    log('Binary already exists');
    return true;
  }
  log('Downloading cloudflared...');
  try {
    const res = await fetch(BIN_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(BIN_PATH, buf);
    fs.chmodSync(BIN_PATH, 0o755);
    log('Binary downloaded:', BIN_PATH, '(' + (buf.length / 1024 / 1024).toFixed(2) + ' MB)');
    return true;
  } catch (e) {
    log('Download failed:', e.message);
    return false;
  }
}

/* ============================================================
 * PUSH URL KE SUPABASE system_config
 * ============================================================ */
async function pushUrlToSupabase(url) {
  try {
    const SB_URL = process.env.SUPABASE_URL;
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SB_URL || !SB_KEY) {
      log('SUPABASE_URL / SUPABASE_SERVICE_KEY belum di-set. Skip push URL.');
      return;
    }

    const res = await fetch(SB_URL + '/rest/v1/system_config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        key: 'bot_api_url',
        value: url,
        updated_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const err = await res.text();
      log('Gagal push URL: ' + res.status + ' ' + err);
      return;
    }

    log('URL berhasil di-push ke Supabase:', url);
  } catch (e) {
    log('pushUrlToSupabase error:', e.message);
  }
}

/* ============================================================
 * START CLOUDFLARE TUNNEL
 * ============================================================ */
export async function startCloudflared() {
  const ok = await ensureBinary();
  if (!ok) {
    log('Skipping tunnel — download failed');
    return null;
  }

  log('Starting tunnel to http://localhost:' + TARGET_PORT);

  cfProcess = spawn(BIN_PATH, [
    'tunnel',
    '--url',
    'http://localhost:' + TARGET_PORT,
    '--no-autoupdate',
  ]);

  return new Promise((resolve) => {
    let resolved = false;

    const handleOutput = async (text) => {
      const m = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m && !resolved) {
        resolved = true;
        tunnelUrl = m[0];
        log('');
        log('===============================================');
        log('  PUBLIC HTTPS URL: ' + tunnelUrl);
        log('===============================================');
        log('');
        await pushUrlToSupabase(tunnelUrl);
        resolve(tunnelUrl);
      }
    };

    cfProcess.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write('[CF] ' + text);
      handleOutput(text);
    });

    cfProcess.stderr.on('data', (data) => {
      const text = data.toString();
      process.stdout.write('[CF] ' + text);
      handleOutput(text);
    });

    cfProcess.on('close', (code) => {
      log('Process exited with code ' + code);
      cfProcess = null;
      tunnelUrl = null;
    });

    cfProcess.on('error', (err) => {
      log('Process error:', err.message);
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(tunnelUrl);
      }
    }, 30000);
  });
}

export function getTunnelUrl() {
  return tunnelUrl;
}

export function stopCloudflared() {
  if (cfProcess) {
    try { cfProcess.kill(); } catch (e) {}
    cfProcess = null;
  }
}