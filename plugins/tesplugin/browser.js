import { randomUUID } from 'crypto'

const BROWSER_HTML = `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;-webkit-tap-highlight-color:transparent}
html,body{width:100%;min-height:100%}
body{background:radial-gradient(circle at 50% -10%,#24345f 0%,#09122d 42%,#030712 100%);padding:8px;color:#eef4ff;overflow-y:auto}
#app{max-width:440px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:center;padding:2px 2px 8px;gap:8px}
.tt{font:900 16px 'Arial Black';color:#e9d79a;text-shadow:0 0 14px #e9d79a55;letter-spacing:1px}
.tt small{display:block;font:700 6.5px Arial;letter-spacing:2px;color:#93a6c9;text-shadow:none}
.hr{background:rgba(0,0,0,.34);border:1px solid rgba(233,215,154,.28);border-radius:9px;padding:3px 9px;text-align:center;min-width:72px}
.hr i{display:block;font:700 7px Arial;font-style:normal;letter-spacing:1px;color:#93a6c9}
.hr b{font:900 11px 'Arial Black';color:#f5d67d}
.ub{display:flex;gap:6px;margin-bottom:6px}
.ub input{flex:1;min-width:0;height:38px;border:2px solid rgba(233,215,154,.28);border-radius:11px;background:rgba(0,0,0,.42);color:#eef4ff;font:600 12px Arial;padding:0 10px;outline:none}
.ub input:focus{border-color:#f5d67d;box-shadow:0 0 10px rgba(245,214,125,.25)}
.ub button{height:38px;padding:0 14px;border:2px solid rgba(233,215,154,.28);border-radius:11px;background:linear-gradient(#d9c27c,#8d6c27);color:#251b07;font:900 12px Arial;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.45)}
.ub button:active{transform:translateY(2px);box-shadow:none;filter:brightness(1.15)}
.nav{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.nav button{height:34px;border:2px solid rgba(255,255,255,.16);border-radius:10px;background:linear-gradient(#344466,#18223a);color:#fff;font:900 14px Arial;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.45)}
.nav button:active{transform:translateY(2px);box-shadow:none;filter:brightness(1.35)}
.view{border:2px solid rgba(233,215,154,.22);border-radius:12px;background:#0a1222;padding:12px;min-height:320px;max-height:68vh;overflow-y:auto;font:400 13px/1.55 Arial;color:#dbe5f7;word-wrap:break-word;overflow-wrap:break-word}
.view a{color:#8fc4ff;text-decoration:underline;cursor:pointer}
.view img{max-width:100%;height:auto;border-radius:6px;margin:4px 0;background:#1a2236}
.view h1,.view h2,.view h3,.view h4{color:#f5d67d;margin:12px 0 6px;font-family:Arial;line-height:1.25}
.view h1{font-size:18px}.view h2{font-size:16px}.view h3{font-size:14px}.view h4{font-size:13px}
.view p{margin:6px 0}
.view ul,.view ol{margin:6px 0 6px 20px}
.view li{margin:3px 0}
.view table{max-width:100%;border-collapse:collapse;font-size:11px;display:block;overflow-x:auto}
.view td,.view th{border:1px solid rgba(233,215,154,.18);padding:3px 5px}
.view pre,.view code{background:#060b16;padding:4px 6px;border-radius:4px;font:11px/1.4 monospace;color:#c9d6f2;overflow-x:auto}
.view pre{display:block;margin:6px 0}
.view blockquote{border-left:3px solid #e9d79a;padding-left:8px;color:#a8b6d3;margin:6px 0}
.view hr{border:none;border-top:1px solid rgba(233,215,154,.18);margin:10px 0}
.view nav,.view header,.view footer{font-size:11px;color:#93a6c9;margin:6px 0}
.ld{text-align:center;padding:40px 0;color:#93a6c9;font:600 12px Arial}
.sp{width:26px;height:26px;margin:0 auto 10px;border:3px solid rgba(233,215,154,.2);border-top-color:#f5d67d;border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.err{text-align:center;padding:40px 10px;color:#ff7a8a;font:700 13px Arial}
.err small{display:block;color:#93a6c9;font-weight:400;margin-top:6px;font-size:11px}
.pt{font:900 14px Arial;color:#f5d67d;padding-bottom:8px;border-bottom:1px solid rgba(233,215,154,.18);margin-bottom:10px}
.home .h1{font:900 14px Arial;color:#f5d67d;margin-bottom:10px}
.bk{display:flex;flex-direction:column;gap:6px}
.lnk{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(233,215,154,.16);border-radius:10px;text-decoration:none;color:#dbe5f7;cursor:pointer}
.lnk:active{background:rgba(233,215,154,.14)}
.lnk b{font:800 12px Arial;color:#f5d67d}
.lnk span{font:600 9px Arial;color:#7b8dae}
.hint{text-align:center;font:600 9px Arial;color:#8fa3c8;margin-top:7px;line-height:1.4}
</style>
<div id="app">
  <div class="hdr">
    <div class="tt">🌐 MINI BROWSER<small>RIMURU · READER MODE</small></div>
    <div class="hr"><i>STATUS</i><b id="st">HOME</b></div>
  </div>
  <div class="ub">
    <input id="url" placeholder="example.com" autocomplete="off" autocapitalize="off" spellcheck="false"/>
    <button id="go">GO</button>
  </div>
  <div class="nav" id="nav">
    <button data-act="back">◀</button>
    <button data-act="fwd">▶</button>
    <button data-act="reload">⟳</button>
    <button data-act="home">⌂</button>
  </div>
  <div class="view" id="view"></div>
  <div class="hint" id="hint">Ketik alamat lalu GO. Konten dibaca dalam mode teks (script diblokir).</div>
</div>
<script>
window.onerror=function(m,s,l){try{var e=document.getElementById('hint');if(e){e.textContent='⚠ '+m+' @'+l;e.style.color='#ff7a8a'}}catch(_){}};
(function(){
'use strict';

var view=document.getElementById('view');
var urlEl=document.getElementById('url');
var stEl=document.getElementById('st');
var hintEl=document.getElementById('hint');

var PROXIES=[
  function(u){return 'https://api.allorigins.win/raw?url='+encodeURIComponent(u)},
  function(u){return 'https://corsproxy.io/?'+encodeURIComponent(u)},
  function(u){return 'https://api.codetabs.com/v1/proxy/?quest='+encodeURIComponent(u)}
];
var stack=[],idx=-1;

function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function setStatus(s,c){stEl.textContent=s;stEl.style.color=c||'#f5d67d'}
function norm(u){u=String(u||'').trim();if(!u)return '';if(!/^https?:\/\//i.test(u))u='https://'+u;try{var x=new URL(u);return x.href}catch(e){return ''}}

async function fetchProxy(u){
  var lastErr;
  for(var i=0;i<PROXIES.length;i++){
    try{
      var r=await fetch(PROXIES[i](u),{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      var t=await r.text();
      if(!t||t.length<20)throw new Error('empty');
      return t;
    }catch(e){lastErr=e}
  }
  throw lastErr||new Error('all proxies failed');
}

function renderHome(){
  view.innerHTML='<div class="home"><div class="h1">📖 Quick Links</div><div class="bk">'
    +'<a class="lnk" data-href="https://en.m.wikipedia.org/wiki/Main_Page"><b>Wikipedia</b><span>en.m.wikipedia.org</span></a>'
    +'<a class="lnk" data-href="https://news.ycombinator.com"><b>Hacker News</b><span>news.ycombinator.com</span></a>'
    +'<a class="lnk" data-href="https://lite.cnn.com"><b>CNN Lite</b><span>lite.cnn.com</span></a>'
    +'<a class="lnk" data-href="https://text.npr.org"><b>NPR Text</b><span>text.npr.org</span></a>'
    +'<a class="lnk" data-href="https://lite.duckduckgo.com/lite/"><b>DuckDuckGo Lite</b><span>lite.duckduckgo.com</span></a>'
    +'<a class="lnk" data-href="https://github.com/trending"><b>GitHub Trending</b><span>github.com</span></a>'
    +'<a class="lnk" data-href="https://id.m.wikipedia.org/wiki/Halaman_Utama"><b>Wikipedia ID</b><span>id.m.wikipedia.org</span></a>'
    +'<a class="lnk" data-href="https://www.reddit.com/r/indonesia/.rss"><b>Reddit ID (RSS)</b><span>reddit.com</span></a>'
    +'</div></div>';
  urlEl.value='';
  setStatus('HOME','#f5d67d');
  hintEl.textContent='Ketik alamat lalu GO. Konten dibaca dalam mode teks.';
  hintEl.style.color='';
  window.scrollTo(0,0);
}

function sanitize(baseUrl,html){
  var doc=new DOMParser().parseFromString(html,'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,noscript,link[rel="stylesheet"],link[rel="preload"],meta[http-equiv]').forEach(function(n){n.remove()});
  doc.querySelectorAll('a[href]').forEach(function(a){
    try{
      var abs=new URL(a.getAttribute('href'),baseUrl).href;
      if(/^https?:/i.test(abs)){a.setAttribute('data-href',abs);}
      a.removeAttribute('href');
      a.removeAttribute('target');
    }catch(e){a.removeAttribute('href')}
  });
  doc.querySelectorAll('img[src]').forEach(function(img){
    try{
      var abs=new URL(img.getAttribute('src'),baseUrl).href;
      img.setAttribute('src',PROXIES[0](abs));
      img.setAttribute('loading','lazy');
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    }catch(e){img.remove()}
  });
  doc.querySelectorAll('form').forEach(function(f){
    f.addEventListener('submit',function(ev){ev.preventDefault()});
    f.setAttribute('onsubmit','return false');
  });
  // strip inline event handlers
  doc.querySelectorAll('*').forEach(function(el){
    for(var i=el.attributes.length-1;i>=0;i--){
      var n=el.attributes[i].name;
      if(/^on/i.test(n))el.removeAttribute(n);
    }
  });
  var title=(doc.querySelector('title')||{}).textContent||baseUrl;
  return {title:title.trim(),body:doc.body?doc.body.innerHTML:''};
}

async function navigate(raw,push){
  var u=norm(raw);
  if(!u){setStatus('BAD URL','#ff7a8a');return}
  if(push!==false){stack=stack.slice(0,idx+1);stack.push(u);idx=stack.length-1}
  urlEl.value=u;
  setStatus('LOAD…','#f5d67d');
  view.innerHTML='<div class="ld"><div class="sp"></div>Memuat '+escapeHtml(u.replace(/^https?:\/\//,'').slice(0,40))+'…</div>';
  window.scrollTo(0,0);
  try{
    var html=await fetchProxy(u);
    var s=sanitize(u,html);
    view.innerHTML='<div class="pt">'+escapeHtml(s.title||u)+'</div><div class="pc">'+s.body+'</div>';
    setStatus('OK','#8fe28f');
    hintEl.textContent='Klik tautan untuk navigasi · Back/Forward di atas.';
    hintEl.style.color='';
  }catch(e){
    view.innerHTML='<div class="err">⚠ Gagal memuat<small>'+escapeHtml(e&&e.message||e)+'</small><small>Coba situs lain, atau reload.</small></div>';
    setStatus('ERR','#ff7a8a');
  }
}

/* Delegated click for links (works for both home & reader content). */
document.addEventListener('click',function(e){
  var t=e.target;
  while(t&&t!==document.body){
    if(t.hasAttribute&&t.hasAttribute('data-href')){
      e.preventDefault();
      navigate(t.getAttribute('data-href'));
      return;
    }
    t=t.parentNode;
  }
});

/* GO / Enter */
document.getElementById('go').addEventListener('click',function(e){e.preventDefault();navigate(urlEl.value)});
urlEl.addEventListener('keydown',function(e){
  if(e.key==='Enter'||e.keyCode===13){e.preventDefault();urlEl.blur();navigate(urlEl.value)}
});

/* Nav buttons */
document.getElementById('nav').addEventListener('click',function(e){
  var b=e.target;
  while(b&&b!==document.body){
    if(b.dataset&&b.dataset.act){
      var a=b.dataset.act;
      if(a==='back'&&idx>0){idx--;navigate(stack[idx],false)}
      else if(a==='fwd'&&idx<stack.length-1){idx++;navigate(stack[idx],false)}
      else if(a==='reload'){if(idx>=0)navigate(stack[idx],false)}
      else if(a==='home'){stack=[];idx=-1;renderHome()}
      return;
    }
    b=b.parentNode;
  }
});

renderHome();
})();
</script>`

const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfoz8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4E5Zfhs2Xh0CT0k+SzhgKd0K/46ChJ20G5+blwpIvahvTVS68+aVIX6CwXs4tcVx6FnmVsMOOkIasfaqQLZYvNBkuLoZnQAq4j8yRekrQ=="

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
                    submessages: [{
                        messageType: 2,
                        messageText: judul
                    }],
                    unifiedResponse: { data },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: "867051314767696@bot"
                        },
                        forwardOrigin: 4
                    }
                }
            }
        }
    }, {})
}

const pluginConfig = {
  name: "browser",
  alias: ['web', 'browse', 'webview', 'br'],
  category: "tools",
  description: "Mini browser (reader mode) inline di WhatsApp",
  usage: ".browser",
  example: ".browser",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
}

async function handler(m, { sock }) {
  try {
    await kirimForwardSigned(sock, m.chat, BROWSER_HTML, '🌐 Mini Browser — Reader Mode')
  } catch (e) {
    console.error('[BROWSER]', e?.message || e)
    await m.reply('❌ Gagal mengirim browser: ' + (e?.message || e))
  }
}

export { pluginConfig as config, handler }
export default { config: pluginConfig, handler }