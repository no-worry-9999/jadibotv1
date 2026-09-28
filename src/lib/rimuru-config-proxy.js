/* ============================================================
 * CONFIG PROXY — Auto-override config dari session context
 * ============================================================ */

import { getSessionConfig } from "./rimuru-session-context.js";

const proxyCache = new WeakMap();

function getOverride(sessionCfg, path) {
  if (!sessionCfg || !path) return undefined;

  if (Object.prototype.hasOwnProperty.call(sessionCfg, path)) {
    return sessionCfg[path];
  }

  const flatKey = path.replace(/\./g, "_");
  if (Object.prototype.hasOwnProperty.call(sessionCfg, flatKey)) {
    return sessionCfg[flatKey];
  }

  return undefined;
}

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

      const override = getOverride(sessionCfg, childPath);
      let value = override !== undefined ? override : obj[prop];

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