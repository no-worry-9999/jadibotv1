/* ============================================================
 * CONFIG PROXY — Auto-override config dari session context
 * ============================================================ */

import { getSessionConfig } from "./rimuru-session-context.js";

const proxyCache = new WeakMap();

/**
 * Cek apakah ada override di session config untuk path ini
 */
function getOverride(sessionCfg, path) {
  if (!sessionCfg || !path) return undefined;

  // Cek dotted path dulu (contoh: "bot.name")
  if (Object.prototype.hasOwnProperty.call(sessionCfg, path)) {
    return sessionCfg[path];
  }

  // Cek flat path (contoh: "botName")
  const flatKey = path.replace(/\./g, "_");
  if (Object.prototype.hasOwnProperty.call(sessionCfg, flatKey)) {
    return sessionCfg[flatKey];
  }

  return undefined;
}

/**
 * Buat Proxy dari config — otomatis override dari session context
 */
export function createConfigProxy(target, path = "") {
  if (target === null || typeof target !== "object") return target;

  if (!proxyCache.has(target)) proxyCache.set(target, new Map());
  const pathMap = proxyCache.get(target);
  if (pathMap.has(path)) return pathMap.get(path);

  const p = new Proxy(target, {
    get(obj, prop) {
      if (typeof prop === "symbol" || prop === "constructor") {
        return obj[prop];
      }

      const childPath = path ? path + "." + String(prop) : String(prop);
      const sessionCfg = getSessionConfig();

      // Cek override dari session
      const override = getOverride(sessionCfg, childPath);
      let value = override !== undefined ? override : obj[prop];

      // Recurse untuk nested object
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return createConfigProxy(value, childPath);
      }

      return value;
    },

    set(obj, prop, value) {
      if (typeof prop === "symbol") {
        obj[prop] = value;
        return true;
      }

      const sessionCfg = getSessionConfig();
      const childPath = path ? path + "." + String(prop) : String(prop);

      // Kalau dalam session, tulis ke override (bukan base)
      if (sessionCfg && typeof sessionCfg === "object") {
        sessionCfg[childPath] = value;
        return true;
      }

      obj[prop] = value;
      return true;
    },

    has(obj, prop) {
      return prop in obj;
    },

    ownKeys(obj) {
      return Reflect.ownKeys(obj);
    },

    getOwnPropertyDescriptor(obj, prop) {
      return Reflect.getOwnPropertyDescriptor(obj, prop);
    },
  });

  pathMap.set(path, p);
  return p;
}

export default { createConfigProxy };