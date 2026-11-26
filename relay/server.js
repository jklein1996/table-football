// Turkey Bowl relay: forwards game messages between phones over WebSockets, so any network works.
const http=require('http'); const {WebSocketServer}=require('ws');
const PORT=+process.env.PORT||8787;
const srv=http.createServer((q,r)=>{ r.writeHead(200,{'content-type':'text/plain','access-control-allow-origin':'*'}); r.end('turkey bowl relay ok'); });
const wss=new WebSocketServer({server:srv, maxPayload:2*1024*1024});
const peers=new Map(), conns=new Map();
const rid=()=>Math.random().toString(36).slice(2,12);
const tx=(ws,m)=>{ try{ if(ws&&ws.readyState===1) ws.send(JSON.stringify(m)); }catch(e){} };
wss.on('connection',ws=>{
  ws.isAlive=true; ws.on('pong',()=>ws.isAlive=true);
  ws.on('message',raw=>{ let m; try{m=JSON.parse(raw);}catch(e){return;}
    if(m.t==='reg'){ const id=m.id?String(m.id).slice(0,64):'p'+rid(); const old=peers.get(id); if(old&&old!==ws){ try{old.close();}catch(e){} } ws._id=id; peers.set(id,ws); tx(ws,{t:'open',id}); console.log(new Date().toISOString(),'reg',id,'peers',peers.size); return; }
    if(!ws._id) return;
    if(m.t==='conn'){ const to=peers.get(m.to); if(!to){ tx(ws,{t:'err',type:'peer-unavailable',cid:m.cid}); return; } conns.set(m.cid,[ws,to]); tx(to,{t:'conn',from:ws._id,cid:m.cid}); return; }
    const c=conns.get(m.cid); if(!c) return; const other=c[0]===ws?c[1]:c[0];
    if(m.t==='connok'||m.t==='msg'){ tx(other,{t:m.t,cid:m.cid,d:m.d}); return; }
    if(m.t==='close'){ conns.delete(m.cid); tx(other,{t:'close',cid:m.cid}); }
  });
  ws.on('close',()=>{ if(ws._id&&peers.get(ws._id)===ws) peers.delete(ws._id);
    for(const [cid,c] of conns){ if(c[0]===ws||c[1]===ws){ conns.delete(cid); tx(c[0]===ws?c[1]:c[0],{t:'close',cid}); } } });
});
setInterval(()=>wss.clients.forEach(ws=>{ if(!ws.isAlive) return ws.terminate(); ws.isAlive=false; try{ws.ping();}catch(e){} }),20000);
srv.listen(PORT,()=>console.log('relay listening on',PORT));
