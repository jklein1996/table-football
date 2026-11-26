// Network first, so tonight's updates always load; falls back to the last saved copy if the Wi-Fi drops.
const CACHE="turkeybowl-v9";
const CORE=["./","index.html","card.html","js/game.js","js/peerjs.min.js","js/qrcode.js","manifest.webmanifest","icons/icon-192.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  e.respondWith(fetch(r).then(res=>{ if(res&&res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)).catch(()=>{}); } return res; }).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))));
});
