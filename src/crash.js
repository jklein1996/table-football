// ---------- Safety nets: crash screen, keep-awake, backups, leave warning ----------
function showCrash(msg){
  if(document.getElementById("crash")) return;
  const d=document.createElement("div"); d.id="crash"; d.className="cover";
  d.innerHTML=`<div class="inner modal"><h2>Something hiccuped</h2><p class="muted">The game is saved after every play. Reload to pick up where you left off.</p><p class="small muted" style="word-break:break-word">${esc(String(msg||"").slice(0,160))}</p><div class="row"><button class="btn primary big" id="crashreload">Reload</button><button class="btn big" id="crashkeep">Keep going</button></div></div>`;
  document.body.appendChild(d);
  d.querySelector("#crashreload").onclick=()=>{ try{ if(S&&(mode==="host"||mode==="local")) saveHost(); }catch(e){} location.reload(); };
  d.querySelector("#crashkeep").onclick=()=>d.remove();
}
window.addEventListener("error",e=>{ if(e&&e.filename&&/peerjs/.test(e.filename)) return; showCrash(e&&e.message); });
window.addEventListener("unhandledrejection",e=>{ const m=String(e&&e.reason&&(e.reason.message||e.reason)||""); if(/wake|peer|webrtc|ice|negotiat/i.test(m)) return; });
// Keep the hosting phone's screen on.
let wakeLock=null;
async function keepAwake(){ try{ if((mode==="host"||mode==="local")&&navigator.wakeLock&&!wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release",()=>{wakeLock=null;}); } }catch(e){ wakeLock=null; } }
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible"){ keepAwake(); if(mode==="host"&&net.peer&&net.peer.disconnected){ try{net.peer.reconnect();}catch(e){} } } });
// Warn before the host closes or leaves the page mid-game.
window.addEventListener("beforeunload",e=>{ if(mode==="host"&&S&&S.phase!=="lobby"&&S.phase!=="over"){ try{saveHost();}catch(_){} e.preventDefault(); e.returnValue=""; } });
// Every player's phone keeps a copy, so another phone can take over hosting.
const BKEY="turkeybowl57.backup";
function saveBackup(){ try{ if(S) localStorage.setItem(BKEY,JSON.stringify(S)); }catch(e){} }
function loadBackup(){ try{ const j=localStorage.getItem(BKEY); const b=j?JSON.parse(j):null; return b&&b.v===4?b:null; }catch(e){ return null; } }
function takeOver(){
  const b=loadBackup()||S; if(!b) return;
  const code=genCode(); const s=JSON.parse(JSON.stringify(b)); s.code=code; s.admin=myId; s.paused=false; delete s.prev;
  try{ if(net.peer) net.peer.destroy(); }catch(e){}
  net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null};
  S=s; addLog(S,null,"A new phone took over hosting. Rejoin with code "+code+"."); saveHost(); hostPeer(code,true); ui.tab="admin"; render();
}
// Installable app: cache the game so a Wi-Fi blip can't stop it from loading.
if("serviceWorker" in navigator && location.protocol==="https:"){ window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); }); }
