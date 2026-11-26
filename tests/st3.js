const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage(); p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('http://127.0.0.1:8080/?v=st'); await p.waitForTimeout(500);
const r=await p.evaluate(()=>{ const T=window.__tb; let ev={}, errs=[];
 for(let g=0;g<150;g++){ const s=T.freshState("TEST"); s.admin="a"; s.players=[{id:"a",name:"A",team:"KC"},{id:"b",name:"B",team:"PHI"}];
  T.handleAction(s,{type:"start"},"a"); T.handleAction(s,{type:"toss"},"a");
  for(let i=0;i<3000&&s.phase!=="over";i++){ const ns=T.needs(s); if(!ns.length) break; const n=ns[0];
   try{
    if(n.kind==="call"){ const pl=n.side==="off"?(s.down===4?(Math.random()<.6?"PUNT":"FG"):["LP","OT","ER","DR","SC","SP","MP","LG","SL","QS","HM"][i%11]):"ABCDEF"[i%6]; T.handleAction(s,{type:"call",side:n.side,play:pl,tempo:"normal",ob:["","out","in"][i%3],coffin:i%2===0},"a"); }
    else if(n.kind==="pat") T.handleAction(s,{type:"pat",k:Math.random()<.1?"2PT":"XP"},"a");
    else if(n.kind==="roll") T.handleAction(s,{type:"roll",side:n.side,onside:Math.random()<.03},"a");
    else { errs.push('unknown need '+JSON.stringify(n)); break; }
   }catch(e){ errs.push(e.message+' '+(e.stack||'').split('\n')[1]); break; }
   if(s.last&&s.last.ev&&s.seq!==s._sq) ev[s.last.ev]=(ev[s.last.ev]||0)+1;
   if(s.last&&s.last.fol&&s.seq!==s._sq) ev['fol_'+s.last.fol.kind]=(ev['fol_'+s.last.fol.kind]||0)+1; if(s.untimed&&s.seq!==s._uq){ev.untimed=(ev.untimed||0)+1;s._uq=s.seq;} if(s.last&&s.last.offset&&s.seq!==s._sq) ev.offset=(ev.offset||0)+1; if(s.last&&s.last.coffin&&s.seq!==s._sq) ev.coffin=(ev.coffin||0)+1; s._sq=s.seq;
  }
  if(s.phase!=="over") errs.push('stuck phase '+s.phase+' needs '+JSON.stringify(T.needs(s)));
 }
 return {ev,errs:errs.slice(0,6),n:errs.length}; });
console.log(JSON.stringify(r.ev)); console.log(r.n, r.errs); await b.close(); })();
