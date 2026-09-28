/* ============================================================
 * SESSION CONTEXT — AsyncLocalStorage untuk per-jadibot config
 * ============================================================ */

import { AsyncLocalStorage } from "async_hooks";

const storage = new AsyncLocalStorage();

/**
 * Jalankan fungsi dengan context session tertentu
 */
export function runWithSession(sessionId, config, fn) {
  return storage.run({ sessionId, config }, fn);
}

/**
 * Ambil context session saat ini
 */
export function getSessionContext() {
  return storage.getStore() || null;
}

/**
 * Ambil config session saat ini
 */
export function getSessionConfig() {
  const ctx = storage.getStore();
  return ctx?.config || null;
}

/**
 * Ambil session ID saat ini
 */
export function getSessionId() {
  const ctx = storage.getStore();
  return ctx?.sessionId || null;
}

export default {
  runWithSession,
  getSessionContext,
  getSessionConfig,
  getSessionId,
};