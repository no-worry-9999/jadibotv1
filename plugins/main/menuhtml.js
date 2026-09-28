import { randomUUID } from 'crypto'
import {
  getCategories,
  getAllPlugins,
} from "../../src/lib/rimuru-plugins.js";

/* ============================================================
 * HTML MENU — TACTICAL DASHBOARD
 * ============================================================ */

function safeJson(val, fallback) {
  try {
    const s = JSON.stringify(val)
    if (typeof s === 'string') {
      return s
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
    }
    return fallback
  } catch (e) {
    console.error('[MENUHTML] safeJson error:', e?.message || e)
    return fallback
  }
}

const MENU_HTML = (data) => {
  const categoriesJson = safeJson(data.categories, '{}')
  const topCommandsJson = safeJson(data.topCommands, '[]')

  return `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'JetBrains Mono','IBM Plex Mono','Consolas',monospace;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html{width:100%;height:auto;min-height:0}
body{width:100%;height:auto;min-height:0;background:#0a0d0f;color:#c9d1d9;overflow-x:hidden;font-weight:500;letter-spacing:.02em}
#app{max-width:440px;margin:0 auto;padding:10px;background:linear-gradient(180deg,#0a0d0f 0%,#0d1114 100%);position:relative;height:auto;min-height:0}
#app::before{content:'';position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.015) 0px,rgba(255,255,255,.015) 1px,transparent 1px,transparent 3px);z-index:1}
#app>*{position:relative;z-index:2}

.tc-hdr{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#0f1418;border:1px solid #1e262c;margin-bottom:12px}
.tc-hdr-logo{width:40px;height:40px;border:1px solid #2a3439;background:#141a1e;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative}
.tc-hdr-logo img{width:100%;height:100%;object-fit:cover;display:block}
.tc-hdr-info{flex:1;min-width:0}
.tc-hdr-title{font:700 12px 'JetBrains Mono',monospace;color:#e6edf3;letter-spacing:.08em;text-transform:uppercase;line-height:1.1}
.tc-hdr-sub{font:500 9px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.15em;text-transform:uppercase;margin-top:2px}
.tc-hdr-burger{width:38px;height:38px;border:1px solid #2a3439;background:#141a1e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;flex-shrink:0;transition:background .12s}
.tc-hdr-burger:active{background:#1c2429}
.tc-hdr-burger span{display:block;width:16px;height:2px;background:#c9d1d9;transition:all .2s}
.tc-hdr-burger.active span:nth-child(1){transform:translateY(6px) rotate(45deg)}
.tc-hdr-burger.active span:nth-child(2){opacity:0}
.tc-hdr-burger.active span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}

.page{display:none;animation:fadeIn .25s ease}
.page.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

.tc-hero{background:#0f1418;border:1px solid #1e262c;margin-bottom:12px;position:relative;overflow:hidden;min-height:180px}
.tc-hero-banner{position:absolute;inset:0;background-image:url('${data.banner}');background-size:cover;background-position:center;filter:brightness(.5) contrast(1.05);z-index:0}
.tc-hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,13,15,.35) 0%,rgba(10,13,15,.8) 55%,rgba(10,13,15,.95) 100%);z-index:1}
.tc-hero-content{position:relative;z-index:2;padding:16px 14px;display:flex;flex-direction:column;justify-content:flex-end;min-height:180px}
.tc-hero-tag{font:500 9px 'JetBrains Mono',monospace;color:#8b949e;letter-spacing:.25em;text-transform:uppercase;margin-bottom:6px}
.tc-hero-title{font:900 26px 'JetBrains Mono',monospace;color:#fff;letter-spacing:-.02em;line-height:.95;margin-bottom:8px;text-transform:uppercase;text-shadow:0 2px 12px rgba(0,0,0,.8)}
.tc-hero-title span{color:#4ade80;text-shadow:0 0 16px rgba(74,222,128,.6),0 2px 12px rgba(0,0,0,.8)}
.tc-hero-desc{font:500 10px 'JetBrains Mono',monospace;color:#c9d1d9;line-height:1.5;text-shadow:0 1px 6px rgba(0,0,0,.9)}
.tc-hero-scan{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#4ade80,transparent);opacity:.6;z-index:3;animation:scan 4s linear infinite}
@keyframes scan{0%{top:0}100%{top:100%}}

.tc-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.tc-stat{background:#0f1418;border:1px solid #1e262c;padding:12px 12px 11px;position:relative}
.tc-stat-lbl{font:500 8.5px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.18em;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:6px}
.tc-stat-lbl .ico{width:12px;height:12px;stroke-width:2;color:#6e7681}
.tc-stat-val{font:900 24px 'JetBrains Mono',monospace;color:#e6edf3;line-height:1;letter-spacing:-.02em}
.tc-stat-val.accent{color:#4ade80}
.tc-stat-val.purple{color:#a78bfa}
.tc-stat-val.cyan{color:#22d3ee}
.tc-stat-val.amber{color:#fbbf24}

.tc-section{margin-bottom:14px}
.tc-sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px}
.tc-sec-title{font:700 10px 'JetBrains Mono',monospace;color:#c9d1d9;letter-spacing:.15em;text-transform:uppercase;display:flex;align-items:center;gap:7px}
.tc-sec-title::before{content:'';width:3px;height:10px;background:#4ade80;box-shadow:0 0 6px rgba(74,222,128,.5)}
.tc-sec-title.purple::before{background:#a78bfa;box-shadow:0 0 6px rgba(167,139,250,.5)}
.tc-sec-count{font:500 9px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.15em;text-transform:uppercase}

.tc-top{background:#0f1418;border:1px solid #1e262c;overflow:hidden}
.tc-top-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #141a1e;position:relative}
.tc-top-row:last-child{border-bottom:none}
.tc-top-rank{font:900 12px 'JetBrains Mono',monospace;color:#4ade80;width:18px;flex-shrink:0;text-align:center}
.tc-top-info{flex:1;min-width:0}
.tc-top-name{font:700 11px 'JetBrains Mono',monospace;color:#e6edf3;letter-spacing:.02em;word-break:break-all;line-height:1.3}
.tc-top-bar{margin-top:5px;height:3px;background:#141a1e;overflow:hidden;position:relative}
.tc-top-bar-in{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#4ade80,#22d3ee);box-shadow:0 0 8px rgba(74,222,128,.4)}
.tc-top-count{font:700 10px 'JetBrains Mono',monospace;color:#8b949e;flex-shrink:0;padding:3px 7px;border:1px solid #2a3439;background:#161b1f;letter-spacing:.08em}

.tc-quick{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tc-qcard{background:#0f1418;border:1px solid #1e262c;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:all .12s}
.tc-qcard:active{background:#141a1e;border-color:#2a3a40}
.tc-qcard-ico{width:32px;height:32px;border:1px solid #2a3439;background:#141a1e;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#8b949e}
.tc-qcard-ico svg{width:16px;height:16px;stroke-width:1.8}
.tc-qcard-info{flex:1;min-width:0}
.tc-qcard-name{font:700 10.5px 'JetBrains Mono',monospace;color:#e6edf3;letter-spacing:.08em;text-transform:uppercase;line-height:1.2;word-break:break-all}
.tc-qcard-count{font:500 9px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.12em;margin-top:3px}

.tc-drawer-body{background:#0f1418;border:1px solid #1e262c;overflow:hidden}
.tc-drawer-item{display:flex;align-items:center;gap:11px;padding:11px 16px;cursor:pointer;transition:background .12s;border-left:2px solid transparent;border-bottom:1px solid #141a1e}
.tc-drawer-item:last-child{border-bottom:none}
.tc-drawer-item:active{background:#141a1e}
.tc-drawer-item .ico{width:20px;height:20px;color:#8b949e;flex-shrink:0}
.tc-drawer-item .ico svg{width:100%;height:100%;stroke-width:1.8;display:block}
.tc-drawer-item .nm{flex:1;font:700 11px 'JetBrains Mono',monospace;color:#c9d1d9;letter-spacing:.08em;text-transform:uppercase;line-height:1.2;word-break:break-all}
.tc-drawer-item .ct{font:700 9.5px 'JetBrains Mono',monospace;color:#6e7681;padding:3px 7px;border:1px solid #2a3439;background:#161b1f;letter-spacing:.08em;flex-shrink:0}

.tc-back{display:flex;align-items:center;gap:9px;padding:11px 14px;background:#0f1418;border:1px solid #1e262c;margin-bottom:12px;cursor:pointer;transition:background .12s}
.tc-back:active{background:#141a1e}
.tc-back-ico{width:22px;height:22px;color:#c9d1d9;flex-shrink:0}
.tc-back-ico svg{width:100%;height:100%;stroke-width:2;display:block}
.tc-back-txt{font:700 10px 'JetBrains Mono',monospace;color:#c9d1d9;letter-spacing:.18em;text-transform:uppercase}
.tc-cat-title{background:#0f1418;border:1px solid #1e262c;padding:14px;margin-bottom:12px;display:flex;align-items:center;gap:12px}
.tc-cat-title-ico{width:44px;height:44px;border:1px solid #2a3439;background:#141a1e;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#4ade80}
.tc-cat-title-ico svg{width:22px;height:22px;stroke-width:1.8}
.tc-cat-title-info{flex:1;min-width:0}
.tc-cat-title-name{font:900 16px 'JetBrains Mono',monospace;color:#fff;letter-spacing:.08em;text-transform:uppercase;line-height:1.1;word-break:break-all}
.tc-cat-title-meta{font:500 9px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.18em;margin-top:4px;text-transform:uppercase}
.tc-cat-title-count{font:900 18px 'JetBrains Mono',monospace;color:#4ade80;flex-shrink:0}

.tc-cmd{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-bottom:1px solid #141a1e;cursor:pointer;transition:background .1s;background:#0d1114}
.tc-cmd:last-child{border-bottom:none}
.tc-cmd:active{background:#141a1e}
.tc-cmd-plus{width:20px;height:20px;border:1px solid #2a3439;background:#141a1e;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#4ade80;font-size:12px;font-weight:700;margin-top:1px;transition:all .15s}
.tc-cmd:active .tc-cmd-plus{background:#4ade80;color:#0a0d0f;border-color:#4ade80}
.tc-cmd-info{flex:1;min-width:0}
.tc-cmd-name{font:700 11px 'JetBrains Mono',monospace;color:#e6edf3;letter-spacing:.02em;word-break:break-all;line-height:1.3}
.tc-cmd-desc{font:500 9.5px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.02em;margin-top:3px;line-height:1.4}
.tc-cmd-alias{font:500 9px 'JetBrains Mono',monospace;color:#484f58;margin-top:3px;letter-spacing:.05em}

.tc-search{position:relative;margin-bottom:12px}
.tc-search input{width:100%;background:#0f1418;border:1px solid #1e262c;padding:11px 12px 11px 38px;color:#e6edf3;font:500 11px 'JetBrains Mono',monospace;letter-spacing:.04em;outline:none;transition:border-color .15s}
.tc-search input:focus{border-color:#2a3a40}
.tc-search input::placeholder{color:#484f58;letter-spacing:.1em;text-transform:uppercase}
.tc-search .tc-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#6e7681;pointer-events:none}
.tc-search .tc-search-ico svg{width:100%;height:100%;stroke-width:2}

.tc-empty{background:#0f1418;border:1px dashed #2a3439;padding:18px 14px;text-align:center}
.tc-empty-plus{width:26px;height:26px;border:1px solid #2a3439;background:#141a1e;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#4ade80;font-size:14px}
.tc-empty-title{font:700 10px 'JetBrains Mono',monospace;color:#8b949e;letter-spacing:.15em;text-transform:uppercase;margin-bottom:4px}
.tc-empty-sub{font:500 9px 'JetBrains Mono',monospace;color:#484f58;letter-spacing:.1em}

.tc-status{background:#0f1418;border:1px solid #1e262c;padding:10px 12px;margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.tc-status-l{display:flex;align-items:center;gap:7px;font:700 9px 'JetBrains Mono',monospace;color:#4ade80;letter-spacing:.15em;text-transform:uppercase}
.tc-status-l::before{content:'';width:6px;height:6px;background:#4ade80;border-radius:50%;box-shadow:0 0 6px #4ade80;animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.tc-status-r{font:500 9px 'JetBrains Mono',monospace;color:#6e7681;letter-spacing:.12em;text-transform:uppercase}

.tc-footer{text-align:center;padding:14px 8px 6px;font:500 8.5px 'JetBrains Mono',monospace;color:#484f58;letter-spacing:.2em;text-transform:uppercase}
.tc-footer b{color:#6e7681}

.toast{position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-100px);background:#0f1418;color:#4ade80;border:1px solid #1c3b26;font:700 10px 'JetBrains Mono',monospace;padding:10px 16px;letter-spacing:.1em;z-index:300;opacity:0;transition:all .3s;pointer-events:none;max-width:90%;text-transform:uppercase;box-shadow:0 0 20px rgba(74,222,128,.15)}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}

.tc-modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:400;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
.tc-modal{background:#0f1418;border:1px solid #4ade80;padding:16px;max-width:340px;width:100%}
.tc-modal-lbl{font:700 9px 'JetBrains Mono',monospace;color:#4ade80;letter-spacing:.2em;text-transform:uppercase;margin-bottom:8px}
.tc-modal-text{background:#0a0d0f;border:1px solid #2a3439;padding:12px;font:700 12px 'JetBrains Mono',monospace;color:#e6edf3;word-break:break-all;user-select:text;-webkit-user-select:text;margin-bottom:10px;letter-spacing:.02em}
.tc-modal-hint{font:500 9px 'JetBrains Mono',monospace;color:#8b949e;letter-spacing:.1em;margin-bottom:12px;text-transform:uppercase;text-align:center}
.tc-modal-btn{width:100%;background:#4ade80;border:none;color:#0a0d0f;font:900 11px 'JetBrains Mono',monospace;padding:10px;letter-spacing:.15em;text-transform:uppercase;cursor:pointer}
</style>

<div id="app">
  <div class="tc-hdr">
    <div class="tc-hdr-logo">
      <img src="${data.logo}" alt="logo" onerror="this.style.display='none'">
    </div>
    <div class="tc-hdr-info">
      <div class="tc-hdr-title">${data.botName}</div>
      <div class="tc-hdr-sub">System // ${data.year}</div>
    </div>
    <div class="tc-hdr-burger" id="burgerBtn">
      <span></span><span></span><span></span>
    </div>
  </div>

  <div class="page active" id="page-dashboard">
    <div class="tc-hero">
      <div class="tc-hero-banner"></div>
      <div class="tc-hero-overlay"></div>
      <div class="tc-hero-scan"></div>
      <div class="tc-hero-content">
        <div class="tc-hero-tag">Command Interface</div>
        <div class="tc-hero-title">Select.<br><span>Control.</span></div>
        <div class="tc-hero-desc">Function database, live stats and connected session status.</div>
      </div>
    </div>

    <div class="tc-section">
      <div class="tc-sec-hdr">
        <div class="tc-sec-title">Live Statistics</div>
        <div class="tc-sec-count">real-time</div>
      </div>
      <div class="tc-stats">
        <div class="tc-stat">
          <div class="tc-stat-lbl">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
            Users
          </div>
          <div class="tc-stat-val purple">${data.totalUsers}</div>
        </div>
        <div class="tc-stat">
          <div class="tc-stat-lbl">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>
            Groups
          </div>
          <div class="tc-stat-val cyan">${data.totalGroups}</div>
        </div>
        <div class="tc-stat">
          <div class="tc-stat-lbl">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
            Commands
          </div>
          <div class="tc-stat-val accent">${data.totalCmd}</div>
        </div>
        <div class="tc-stat">
          <div class="tc-stat-lbl">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Categories
          </div>
          <div class="tc-stat-val amber">${data.totalCat}</div>
        </div>
      </div>
    </div>

    <div class="tc-section">
      <div class="tc-sec-hdr">
        <div class="tc-sec-title purple">Most Used</div>
        <div class="tc-sec-count">top 5</div>
      </div>
      <div id="topUsed"></div>
    </div>

    <div class="tc-section">
      <div class="tc-sec-hdr">
        <div class="tc-sec-title">Quick Access</div>
        <div class="tc-sec-count">tap to open</div>
      </div>
      <div class="tc-quick" id="quickGrid"></div>
    </div>

    <div class="tc-status">
      <div class="tc-status-l">System Online</div>
      <div class="tc-status-r">${data.uptime} uptime</div>
    </div>

    <div class="tc-footer">© ${data.year} <b>${data.botName}</b> · v${data.version}</div>
  </div>

  <div class="page" id="page-navigation">
    <div class="tc-back" id="navBackBtn">
      <div class="tc-back-ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </div>
      <div class="tc-back-txt">Back to Dashboard</div>
    </div>

    <div class="tc-cat-title">
      <div class="tc-cat-title-ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      </div>
      <div class="tc-cat-title-info">
        <div class="tc-cat-title-name">Navigation</div>
        <div class="tc-cat-title-meta">${data.totalCat} function groups</div>
      </div>
      <div class="tc-cat-title-count">${data.totalCat}</div>
    </div>

    <div class="tc-drawer-body" id="navList"></div>

    <div class="tc-status">
      <div class="tc-status-l">Navigation Ready</div>
      <div class="tc-status-r">${data.totalCat} groups</div>
    </div>

    <div class="tc-footer">© ${data.year} <b>${data.botName}</b> · v${data.version}</div>
  </div>

  <div class="page" id="page-category">
    <div class="tc-back" id="backBtn">
      <div class="tc-back-ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </div>
      <div class="tc-back-txt">Back to Navigation</div>
    </div>

    <div class="tc-cat-title">
      <div class="tc-cat-title-ico" id="catTitleIcon"></div>
      <div class="tc-cat-title-info">
        <div class="tc-cat-title-name" id="catTitleName">—</div>
        <div class="tc-cat-title-meta">function group</div>
      </div>
      <div class="tc-cat-title-count" id="catTitleCount">0</div>
    </div>

    <div class="tc-search">
      <div class="tc-search-ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
        </svg>
      </div>
      <input id="searchEl" placeholder="Search function..." autocomplete="off">
    </div>

    <div id="cmdList"></div>

    <div class="tc-status">
      <div class="tc-status-l">Category Loaded</div>
      <div class="tc-status-r" id="statusRight">0 entries</div>
    </div>

    <div class="tc-footer">© ${data.year} <b>${data.botName}</b> · v${data.version}</div>
  </div>

  <div class="toast" id="toastEl"></div>
</div>

<script>
(function(){
'use strict';

window.addEventListener('error', function(e){
  if(e && e.message && String(e.message).indexOf('ResizeObserver') >= 0){
    e.stopImmediatePropagation(); e.preventDefault(); return true;
  }
}, true);

var CATEGORIES = ${categoriesJson};
if(!CATEGORIES || typeof CATEGORIES !== 'object' || Array.isArray(CATEGORIES)) CATEGORIES = {};

var TOP_USED = ${topCommandsJson};
if(!Array.isArray(TOP_USED)) TOP_USED = [];

var I = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5l9-7.5 9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H14v-6h-4v6H4.5A1.5 1.5 0 0 1 3 20z"/></svg>',
  game:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 11v4M5 13h4M16 11.5h.01M19 13.5h.01"/></svg>',
  wrench:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v14M6 13l6 6 6-6M4 21h16"/></svg>',
  brush:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-6 6v3h3l6-6"/><path d="M9 11l7-7 4 4-7 7"/><path d="M14 6l4 4"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  crown:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 19h20l-2-10-5 4-3-7-3 7-5-4z"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z"/></svg>',
  robot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="12" rx="2"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M12 4v3M9 19v2M15 19v2"/></svg>',
  music:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  image:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
  text:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v5h1"/></svg>',
  gem:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M8 3l4 6 4-6M12 21L8 9M12 21l4-12"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  party:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l9-18 9 18z"/><path d="M9 15h6M10 12h4"/></svg>',
  dice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/><circle cx="8.5" cy="15.5" r="1"/></svg>',
  pallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a10 10 0 1 1 10-10c0 4-3 5-5 5h-3a2 2 0 0 0-1 3.8A2 2 0 0 1 12 22z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  sword:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/></svg>',
  coin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>',
  megaph:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M14 8a4 4 0 0 1 0 8M17 5a8 8 0 0 1 0 14"/></svg>',
  tv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 3l4 4 4-4"/></svg>',
  cloud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 7 19z"/></svg>',
  scroll:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h10a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V7M6 11l6-6 6 6M4 3h16"/></svg>',
  quote:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8c-3 2-3 6-3 8 0 3 2 4 4 4s3-1 3-3-1-3-3-3h-1c0-2 1-4 3-5zM17 8c-3 2-3 6-3 8 0 3 2 4 4 4s3-1 3-3-1-3-3-3h-1c0-2 1-4 3-5z"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  store:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M9 20v-6h6v6"/><path d="M3 9h18"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
  speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a9 9 0 0 1 0 12"/></svg>',
  monitor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  flask:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v7L4 20a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-11V2M8 2h8M6.5 15h11"/></svg>',
  box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3M3 8h18M12 12h.01"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>',
  arrows:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 0 0-4 4v2M3 18h12a4 4 0 0 0 4-4v-2"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>'
};

var META = {
  main:{i:'home'},general:{i:'info'},game:{i:'game'},rpg:{i:'sword'},
  tools:{i:'wrench'},utility:{i:'gear'},download:{i:'down'},downloader:{i:'down'},
  downloads:{i:'down'},upload:{i:'upload'},sticker:{i:'brush'},group:{i:'users'},
  owner:{i:'crown'},admin:{i:'shield'},ai:{i:'robot'},audio:{i:'music'},
  music:{i:'music'},tts:{i:'speaker'},image:{i:'image'},ephoto:{i:'image'},
  canvas:{i:'pallet'},text:{i:'text'},info:{i:'info'},berita:{i:'scroll'},
  premium:{i:'gem'},islamic:{i:'moon'},religi:{i:'moon'},fun:{i:'party'},
  random:{i:'dice'},maker:{i:'brush'},anime:{i:'sparkle'},asupan:{i:'tv'},
  cek:{i:'eye'},clan:{i:'sword'},colorgrade:{i:'pallet'},convert:{i:'arrows'},
  economy:{i:'coin'},elaina:{i:'sparkle'},internet:{i:'globe'},jpm:{i:'megaph'},
  media:{i:'tv'},panel:{i:'monitor'},linode:{i:'cloud'},primbon:{i:'scroll'},
  pushkontak:{i:'upload'},quotes:{i:'quote'},search:{i:'search'},stalker:{i:'eye'},
  store:{i:'store'},'store_autorder':{i:'store'},user:{i:'user'},vps:{i:'monitor'},
  test:{i:'flask'},cecan:{i:'sparkle'},other:{i:'box'},uncategorized:{i:'box'}
};

function getIcon(cat){ var m = META[cat] || META.other; return I[m.i] || I.box; }
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

var currentCat = null;
var toastTO;

function toast(msg){
  var el=document.getElementById('toastEl');
  if(!el) return;
  el.textContent=msg; el.classList.add('show');
  clearTimeout(toastTO);
  toastTO=setTimeout(function(){el.classList.remove('show')},1800);
}

var burger = document.getElementById('burgerBtn');
var navBackBtn = document.getElementById('navBackBtn');

function showPage(name){
  var pages = document.querySelectorAll('.page');
  for(var i=0;i<pages.length;i++) pages[i].classList.remove('active');
  var el = document.getElementById('page-' + name);
  if(el) el.classList.add('active');

  // 1. Reset scroll di semua level
  try {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch(e) {}

  // 2. Paksa body & html shrink ke konten (WebView WA kadang nyimpen tinggi lama)
  try {
    document.body.style.height = 'auto';
    document.body.style.minHeight = '0';
    document.documentElement.style.height = 'auto';
    document.documentElement.style.minHeight = '0';
    var app = document.getElementById('app');
    if(app) {
      app.style.height = 'auto';
      app.style.minHeight = '0';
    }
  } catch(e) {}

  // 3. Force reflow — trik WebView WA biar layout dihitung ulang
  try {
    document.body.style.display = 'none';
    void document.body.offsetHeight; // trigger reflow
    document.body.style.display = '';
  } catch(e) {}
}

function openNav(){
  showPage('navigation');
  burger.classList.add('active');
}
function closeNav(){
  showPage('dashboard');
  burger.classList.remove('active');
}

burger.addEventListener('click', function(){
  var navActive = document.getElementById('page-navigation').classList.contains('active');
  if(navActive) closeNav(); else openNav();
});

if(navBackBtn) navBackBtn.addEventListener('click', closeNav);

function buildDrawer(){
  var body = document.getElementById('navList');
  if(!body) return;

  var cats = Object.keys(CATEGORIES).sort(function(a,b){
    if(a === 'main') return -1;
    if(b === 'main') return 1;
    return a.localeCompare(b);
  });

  var html = '';

  for(var i=0;i<cats.length;i++){
    var cat = cats[i];
    var count = (CATEGORIES[cat]||[]).length;
    if(!count) continue;

    html += '<div class="tc-drawer-item" data-cat="'+esc(cat)+'">';
    html += '<div class="ico">'+getIcon(cat)+'</div>';
    html += '<div class="nm">'+esc(cat)+'</div>';
    html += '<div class="ct">'+count+'</div>';
    html += '</div>';
  }

  if(!html){
    html = '<div class="tc-empty"><div class="tc-empty-title">Empty</div><div class="tc-empty-sub">no categories loaded</div></div>';
  }

  body.innerHTML = html;

  body.onclick = function(e){
    var item = e.target.closest('.tc-drawer-item');
    if(!item) return;
    var cat = item.getAttribute('data-cat');
    if(cat) openCategory(cat);
    burger.classList.remove('active');
  };
}

function openCategory(cat){
  currentCat = cat;
  var cmds = CATEGORIES[cat] || [];

  document.getElementById('catTitleIcon').innerHTML = getIcon(cat);
  document.getElementById('catTitleName').textContent = cat.toUpperCase();
  document.getElementById('catTitleCount').textContent = cmds.length;
  document.getElementById('searchEl').value = '';
  document.getElementById('statusRight').textContent = cmds.length + ' entries';

  renderCommands('');
  showPage('category');
  burger.classList.remove('active');
}

function renderCommands(filter){
  if(!currentCat){ return; }
  var cmds = CATEGORIES[currentCat] || [];
  filter = (filter||'').toLowerCase().trim();

  var filtered = filter
    ? cmds.filter(function(c){
        if(!c || typeof c !== 'object') return false;
        return String(c.name||'').toLowerCase().indexOf(filter) >= 0 ||
               (Array.isArray(c.alias)?c.alias.join(' '):'').toLowerCase().indexOf(filter) >= 0 ||
               String(c.desc||'').toLowerCase().indexOf(filter) >= 0;
      })
    : cmds;

  var html = '';
  if(!filtered.length){
    html = '<div class="tc-empty"><div class="tc-empty-plus">+</div>'+
      '<div class="tc-empty-title">'+(filter?'No matches':'Empty category')+'</div>'+
      '<div class="tc-empty-sub">'+(filter?'try another keyword':'no commands found')+'</div></div>';
  } else {
    for(var i=0;i<filtered.length;i++){
      var c = filtered[i];
      html += '<div class="tc-cmd" data-cmd="'+esc(c.name)+'">';
      html += '<div class="tc-cmd-plus">+</div>';
      html += '<div class="tc-cmd-info">';
      html += '<div class="tc-cmd-name">'+esc(c.name)+'</div>';
      if(c.desc) html += '<div class="tc-cmd-desc">'+esc(c.desc)+'</div>';
      if(c.alias && c.alias.length) html += '<div class="tc-cmd-alias">alias: '+esc(c.alias.join(', '))+'</div>';
      html += '</div>';
      html += '</div>';
    }
  }
  document.getElementById('cmdList').innerHTML = html;
  document.getElementById('statusRight').textContent = filtered.length + ' entries';
}

document.getElementById('cmdList').addEventListener('click', function(e){
  var cmd = e.target.closest('.tc-cmd');
  if(cmd) copyToClipboard(cmd.getAttribute('data-cmd'));
});

document.getElementById('backBtn').addEventListener('click', function(){
  showPage('navigation');
});

function renderTopUsed(){
  var box = document.getElementById('topUsed');
  if(!TOP_USED.length){
    box.innerHTML = '<div class="tc-empty"><div class="tc-empty-plus">+</div>'+
      '<div class="tc-empty-title">No data yet</div>'+
      '<div class="tc-empty-sub">usage tracking is empty</div></div>';
    return;
  }
  var max = 1;
  for(var i=0;i<TOP_USED.length;i++){
    if((TOP_USED[i].count||0) > max) max = TOP_USED[i].count;
  }
  var html = '<div class="tc-top">';
  for(var j=0;j<TOP_USED.length;j++){
    var t = TOP_USED[j];
    var pct = Math.round(((t.count||0)/max)*100);
    html += '<div class="tc-top-row">';
    html += '<div class="tc-top-rank">'+(j+1)+'</div>';
    html += '<div class="tc-top-info">';
    html += '<div class="tc-top-name">'+esc(t.name)+'</div>';
    html += '<div class="tc-top-bar"><div class="tc-top-bar-in" style="width:'+pct+'%"></div></div>';
    html += '</div>';
    html += '<div class="tc-top-count">'+t.count+'</div>';
    html += '</div>';
  }
  html += '</div>';
  box.innerHTML = html;
}

function renderQuickAccess(){
  var box = document.getElementById('quickGrid');
  var cats = Object.keys(CATEGORIES).map(function(k){
    return { cat: k, count: (CATEGORIES[k]||[]).length };
  }).filter(function(x){ return x.count > 0; })
    .sort(function(a,b){ return b.count - a.count; })
    .slice(0, 6);

  if(!cats.length){
    box.innerHTML = '<div class="tc-empty" style="grid-column:1/-1"><div class="tc-empty-title">Empty</div></div>';
    return;
  }

  var html = '';
  for(var i=0;i<cats.length;i++){
    var c = cats[i];
    html += '<div class="tc-qcard" data-cat="'+esc(c.cat)+'">';
    html += '<div class="tc-qcard-ico">'+getIcon(c.cat)+'</div>';
    html += '<div class="tc-qcard-info">';
    html += '<div class="tc-qcard-name">'+esc(c.cat)+'</div>';
    html += '<div class="tc-qcard-count">'+c.count+' commands</div>';
    html += '</div>';
    html += '</div>';
  }
  box.innerHTML = html;

  box.onclick = function(e){
    var card = e.target.closest('.tc-qcard');
    if(!card) return;
    openCategory(card.getAttribute('data-cat'));
  };
}

var searchEl = document.getElementById('searchEl');
var searchTO;
searchEl.addEventListener('input', function(e){
  clearTimeout(searchTO);
  var val = e.target.value;
  searchTO = setTimeout(function(){ renderCommands(val) }, 150);
});

function copyToClipboard(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){
      toast('COPIED :: ' + text);
    }).catch(function(){
      fallbackCopy(text);
    });
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text){
  try{
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, 999999);
    var ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if(ok){
      toast('COPIED :: ' + text);
    } else {
      showManualCopy(text);
    }
  }catch(err){
    showManualCopy(text);
  }
}

function showManualCopy(text){
  var old = document.getElementById('tcModalOv');
  if(old) old.parentNode.removeChild(old);

  var ov = document.createElement('div');
  ov.className = 'tc-modal-ov';
  ov.id = 'tcModalOv';
  ov.innerHTML =
    '<div class="tc-modal">' +
      '<div class="tc-modal-lbl">Manual Copy</div>' +
      '<div class="tc-modal-text" id="tcModalText"></div>' +
      '<div class="tc-modal-hint">Tekan lama teks di atas → Copy</div>' +
      '<button class="tc-modal-btn" id="tcModalClose">Tutup</button>' +
    '</div>';
  document.body.appendChild(ov);

  var txt = document.getElementById('tcModalText');
  txt.textContent = text;

  document.getElementById('tcModalClose').onclick = function(){
    if(ov.parentNode) ov.parentNode.removeChild(ov);
  };
}

buildDrawer();
renderTopUsed();
renderQuickAccess();
showPage('dashboard');

})();
</script>`
}

/* ============================================================
 * ASSETS
 * ============================================================ */

const BANNER_URL = "https://files.catbox.moe/xpudmx.jpg"
const LOGO_URL   = "https://files.catbox.moe/tn1kaw.jpg"

/* ============================================================
 * SIGNATURE & CERTIFICATE (JANGAN DIUBAH)
 * ============================================================ */

const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ=="

/* ============================================================
 * KIRIM FORWARD SIGNED
 * ============================================================ */

async function kirimForwardSigned(conn, chatId, html, judul) {
  const data = Buffer.from(JSON.stringify({
    __typename: 'GenAIUnifiedResponse',
    response_id: randomUUID(),
    sections: [{
      __typename: 'GenAIUnifiedResponseSection',
      view_model: {
        __typename: 'GenAISingleLayoutViewModel',
        primitive: {
          __typename: 'GenAIaeacdsnwHtmlPrimitive',
          payload: html,
          trusted_sources: []
        }
      }
    }]
  })).toString('base64')

  return conn.relayMessage(chatId, {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: "",
        botResponseId: randomUUID(),
        verificationMetadata: {
          proofs: [{
            version: 1,
            useCase: 1,
            signature: SIG,
            certificateChain: [CERT1, CERT2]
          }]
        }
      }
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: judul }],
          unifiedResponse: { data },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
            forwardOrigin: 4
          }
        }
      }
    }
  }, {})
}

/* ============================================================
 * PLUGIN CONFIG
 * ============================================================ */

const pluginConfig = {
  name: "menuhtml",
  alias: ['menuh', 'hmenu', 'menux'],
  category: "main",
  description: "Tampilkan menu bot dengan dashboard + navigasi kategori",
  usage: "/menuhtml",
  example: "/menuhtml",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 2,
  energi: 0,
  isEnabled: true,
}

/* ============================================================
 * HELPER
 * ============================================================ */

const DEBUG = true

function log(...args) { if (DEBUG) console.log('[MENUHTML]', ...args) }
function logErr(...args) { console.error('[MENUHTML]', ...args) }

function formatUptime(sec) {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return d + 'd ' + h + 'h'
  if (h > 0) return h + 'h ' + m + 'm'
  return m + 'm'
}

function toRoman(num) {
  const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]
  let out = ''
  for (const [v, s] of map) { while (num >= v) { out += s; num -= v } }
  return out
}

function buildCategoriesFromHelper(prefix = '/') {
  const out = {}
  const seen = new Set()

  let allPlugins = []
  try {
    allPlugins = getAllPlugins() || []
    log(`getAllPlugins() → ${allPlugins.length} plugin`)
  } catch (e) {
    logErr('getAllPlugins() error:', e?.message || e)
    return out
  }

  for (const plugin of allPlugins) {
    const cfg = plugin?.config
    if (!cfg) continue
    const rawName = cfg.name
    if (!rawName) continue
    if (cfg.isEnabled === false) continue

    const names = Array.isArray(rawName) ? rawName : [rawName]
    const primaryName = names[0]
    if (!primaryName) continue

    const dedupeKey = String(primaryName).toLowerCase()
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const cat = String(cfg.category || 'uncategorized').toLowerCase()
    if (!out[cat]) out[cat] = []

    let cmdName = cfg.usage
    if (!cmdName) cmdName = prefix + primaryName
    cmdName = String(cmdName).replace(/^[./!#]/, prefix)

    out[cat].push({
      name: cmdName,
      alias: Array.isArray(cfg.alias) ? cfg.alias : [],
      desc: cfg.description || '',
    })
  }

  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => a.name.localeCompare(b.name))
  }

  if (DEBUG) {
    log('Total kategori:', Object.keys(out).length)
    log('Total command:', Object.values(out).reduce((a, b) => a + b.length, 0))
  }

  return out
}

function getLiveStats() {
  let users = 0
  let groups = 0
  let topCommands = []

  try {
    const store =
      global?.store ||
      global?.db ||
      global?.database ||
      null

    if (store) {
      if (store.users && typeof store.users === 'object') {
        users = Object.keys(store.users).length
      } else if (store.contacts && typeof store.contacts === 'object') {
        users = Object.keys(store.contacts).length
      }

      if (store.groups && typeof store.groups === 'object') {
        groups = Object.keys(store.groups).length
      } else if (store.chats && typeof store.chats === 'object') {
        groups = Object.values(store.chats).filter(
          (c) => c && typeof c.id === 'string' && c.id.endsWith('@g.us')
        ).length
      }
    }
  } catch (e) {
    logErr('getLiveStats store error:', e?.message || e)
  }

  try {
    const usage = global?.commandUsage
    if (usage && typeof usage === 'object') {
      topCommands = Object.entries(usage)
        .map(([name, count]) => ({ name, count: Number(count) || 0 }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  } catch (e) {
    logErr('getLiveStats usage error:', e?.message || e)
  }

  return { users, groups, topCommands }
}

/* ============================================================
 * HANDLER
 * ============================================================ */

async function handler(m, ctx) {
  try {
    const { sock, config, uptime } = ctx || {}
    if (!sock) throw new Error('sock tidak tersedia di context')

    const prefix =
      config?.prefix || global?.prefix || global?.config?.prefix || '/'

    const categories = buildCategoriesFromHelper(prefix)
    const totalCmd = Object.values(categories).reduce((a, b) => a + b.length, 0)
    const totalCat = Object.keys(categories).length

    const stats = getLiveStats()

    const botName =
      config?.botName || global?.botName || global?.config?.botName || 'BOT'
    const version =
      config?.version || global?.version || global?.config?.version || '1.0'

    const year = new Date().getFullYear()
    const roman = toRoman(year)

    const html = MENU_HTML({
      botName,
      version,
      uptime: formatUptime(uptime ?? process.uptime()),
      totalCmd,
      totalCat,
      categories,
      totalUsers: stats.users,
      totalGroups: stats.groups,
      topCommands: stats.topCommands,
      year: roman,
      banner: BANNER_URL,
      logo: LOGO_URL,
    })

    await kirimForwardSigned(sock, m.chat, html, '📋 DASHBOARD')
    log('Menu berhasil dikirim.')
  } catch (e) {
    logErr('handler error:', e?.stack || e?.message || e)
    try { await m.reply('❌ Gagal menampilkan menu: ' + (e?.message || e)) } catch {}
  }
}

/* ============================================================
 * EXPORT
 * ============================================================ */

export { pluginConfig as config, handler }
export default { config: pluginConfig, handler }