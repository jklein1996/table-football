// ---------- Players, turns, actions (host is the single source of truth) ----------
function teamList(s,team){ return s.players.filter(p=>p.team===team); }
function pickRot(s,team,key){ const L=teamList(s,team); if(!L.length) return null; return L[((s[key][team]||0)%L.length+L.length)%L.length]; }
function callerOf(s,team){ return pickRot(s,team,"ci"); }
function rollerOf(s,team){ const L=teamList(s,team); if(!L.length) return null; return L[(((s.ci[team]||0)+(L.length>1?1:0)+(s.ro[team]||0))%L.length+L.length)%L.length]; }
// Your own dice: three dice, set by color in the lobby. Die 1 is the tens die, dice 2 and 3 the ones dice.
// The defense rolls two of the same dice and reads them with the red and green tables.
const DCOLS={black:["Black","#0b0b0b","#fff"],white:["White","#f4f1ea","#111"],red:["Red","#c8102e","#fff"],blue:["Blue","#1d5fd1","#fff"],green:["Green","#1f8a3b","#fff"],
  yellow:["Yellow","#f2c200","#111"],orange:["Orange","#f26a1b","#fff"],purple:["Purple","#6b3fb5","#fff"],pink:["Pink","#ff6fae","#111"],gray:["Gray","#8a8f8c","#111"],clear:["Clear","#dfe8ee","#111"]};
const DICE0={c:["black","white","blue"],d:[1,2]};
const diceCfg=s=>(s&&s.dice)||DICE0;
// Change the #CODE in the address bar without adding a history entry (so Back isn't hijacked).
function setHash(c){ try{ history.replaceState(history.state,"",location.pathname+location.search+(c?"#"+c:"")); }catch(_){ location.hash=c; } }
const ST=k=>k==="PUNT"||k==="FG"||k==="SPIKE"||k==="KNEEL";
const NOROLL=k=>k==="SPIKE"||k==="KNEEL";
// What is the game waiting on? [{team, kind:'call'|'roll'|'pat'|'toss'|'start', side:'off'|'def'}]
function needs(s){
  const P=s.pend||{}; const out=[];
  if(s.phase==="lobby") return [{kind:"start"}];
  if(s.phase==="toss") return [{kind:"toss"}];
  if(s.phase==="over") return [];
  if(s.phase==="kickoff"){ if(!P.od) out.push({team:s.kicker,kind:"roll",side:"off"}); return out; }
  if(s.follow) return [{team:s.follow.team,kind:"roll",side:"fol",fol:s.follow.kind}];
  const off=s.poss, def=other(s.poss);
  if(s.phase==="pat"&&!P.pat) return [{team:off,kind:"pat",side:"off"}];
  if(s.phase==="pat"&&P.pat==="XP"){ if(!P.od) out.push({team:off,kind:"roll",side:"off"}); return out; }
  // play or 2pt
  const callsNeeded=[];
  if(!P.oc) callsNeeded.push({team:off,kind:"call",side:"off"});
  if(!(P.oc&&ST(P.oc)) && !P.dc) callsNeeded.push({team:def,kind:"call",side:"def"});
  if(callsNeeded.length) return callsNeeded;
  if(NOROLL(P.oc)) return out;
  if(!P.od) out.push({team:off,kind:"roll",side:"off"});
  if(!ST(P.oc) && !P.dd) out.push({team:def,kind:"roll",side:"def"});
  return out;
}
function whoFor(s,n){ return n.kind==="roll"?rollerOf(s,n.team):(n.kind==="call"||n.kind==="pat")?callerOf(s,n.team):null; }
function canAct(s,pid,n){
  if(pid===s.admin) return true;
  const w=whoFor(s,n); return !!(w&&w.id===pid);
}
function validDice(d,keys){ return d&&keys.every(k=>Number.isInteger(d[k])&&d[k]>=1&&d[k]<=6); }
function snapshotPrev(s){ const c=JSON.parse(JSON.stringify(s)); delete c.prev; s.prev=JSON.stringify(c); }

// Returns true if state changed
function handleAction(s,a,pid){
  if(!a||typeof a!=="object") return false;
  const isAdmin=pid===s.admin;
  const adminOnly=["dice","admin","kick","move","up","settings","start","toss","newgame","undo","skip","pause"];
  if(s.paused && !(isAdmin&&adminOnly.includes(a.type)) && a.type!=="join" && a.type!=="leave") return false;
  switch(a.type){
    case "join":{
      const name=String(a.name||"").trim().slice(0,18)||"Player"; const team=a.team==="PHI"?"PHI":a.team==="KC"?"KC":null; if(!team) return false;
      const ex=s.players.find(p=>p.id===pid);
      if(ex){ if(ex.team!==team){ s.players=s.players.filter(p=>p.id!==pid); s.players.push({id:pid,name,team}); } else ex.name=name; }
      else s.players.push({id:pid,name,team});
      if(s.autoAdmin && name.toLowerCase()===s.autoAdmin && s.admin===s.host) s.admin=pid;
      return true; }
    case "leave": s.players=s.players.filter(p=>p.id!==pid); return true;
    case "admin": if(!isAdmin) return false; { const p=s.players.find(x=>x.id===a.pid); if(!p) return false; s.admin=p.id; addLog(s,null,`${p.name} is now the admin.`); return true; }
    case "kick": if(!isAdmin) return false; s.players=s.players.filter(p=>p.id!==a.pid); return true;
    case "move": if(!isAdmin) return false; { const p=s.players.find(x=>x.id===a.pid); if(!p) return false; s.players=s.players.filter(x=>x.id!==a.pid); p.team=other(p.team); s.players.push(p); return true; }
    case "up": if(!isAdmin) return false; { const i=s.players.findIndex(x=>x.id===a.pid); if(i<0) return false; const t=s.players[i].team; let j=i-1; while(j>=0&&s.players[j].team!==t) j--; if(j<0) return false; const tmp=s.players[j]; s.players[j]=s.players[i]; s.players[i]=tmp; return true; }
    case "settings": if(!isAdmin) return false; { const m=+a.qmin, n=+a.nq; if(QMINS.includes(m)){ s.qmin=m; if(s.phase==="lobby"||s.phase==="toss") s.clock=m*60; } if(NQS.includes(n)&&(s.phase==="lobby"||s.phase==="toss"||n>=s.q)) s.nq=n; return true; }
    case "dice": if(!isAdmin) return false; { const c=Array.isArray(a.c)?a.c.slice(0,3):[]; const d=Array.isArray(a.d)?a.d.map(Number):[];
      if(c.length!==3||!c.every(x=>DCOLS[x])||d.length!==2||d[0]===d[1]||!d.every(i=>i>=0&&i<=2)) return false; s.dice={c,d}; return true; }
    case "pause": if(!isAdmin) return false; s.paused=!!a.on; addLog(s,null,s.paused?"Game paused by the admin.":"Game resumed."); return true;
    case "timeout":{ const t=a.team==="PHI"?"PHI":a.team==="KC"?"KC":null; if(!t) return false; const me=s.players.find(p=>p.id===pid); if(!(isAdmin||(me&&me.team===t))) return false;
      if(s.phase!=="play"||s.follow||s.pend.od||s.pend.dd||!(s.to[t]>0)) return false; s.to[t]--; s.running=false; addLog(s,t,`Timeout ${TEAMS[t].name} (${s.to[t]} left). Clock stopped at ${fmtClock(s.clock)}.`); s.last={txt:`Timeout, ${TEAMS[t].name}. Clock stopped at ${fmtClock(s.clock)}.`,cls:"",team:t}; return true; }
    case "start": if(!isAdmin||s.phase!=="lobby") return false; s.phase="toss"; s.clock=s.qmin*60; return true;
    case "toss": if(!isAdmin||s.phase!=="toss") return false; { snapshotPrev(s); const recv=Math.random()<.5?"KC":"PHI"; s.recv1=recv; s.kicker=other(recv); s.phase="kickoff"; s.pend={}; addLog(s,recv,`${TEAMS[recv].name} win the toss and receive.`); s.last={txt:`${TEAMS[recv].name} win the toss and will receive. ${TEAMS[s.kicker].name} kick off.`,cls:""}; return true; }
    case "newgame": if(!isAdmin) return false; { const keep=s.players, adm=s.admin, code=s.code; const n=newGame(s.qmin,s.nq); Object.assign(s,n,{players:keep,admin:adm,code,rev:s.rev,started:Date.now(),ci:{KC:0,PHI:0},ro:{KC:0,PHI:0},pend:{}}); delete s.prev; return true; }
    case "undo": if(!isAdmin||!s.prev) return false; { const p=JSON.parse(s.prev); const keep=s.players; const rev=s.rev; Object.keys(s).forEach(k=>delete s[k]); Object.assign(s,p,{players:keep,rev}); s.last={txt:"Admin undid the last play.",cls:""}; return true; }
    case "skip": if(!isAdmin) return false; { const t=a.team==="PHI"?"PHI":"KC"; if(a.which==="roll") s.ro[t]=(s.ro[t]||0)+1; else s.ci[t]=(s.ci[t]||0)+1; return true; }
    case "pat":{ const n=needs(s).find(x=>x.kind==="pat"); if(!n||!canAct(s,pid,n)) return false; if(a.k!=="XP"&&a.k!=="2PT") return false; s.pend.pat=a.k; s.pend.patBy=n.team; if(a.k==="2PT") s.ball=ownToAbs(s.poss,98); return true; }
    case "call":{
      const ns=needs(s); const n=ns.find(x=>x.kind==="call"&&x.side===a.side); if(!n||!canAct(s,pid,n)) return false;
      if(a.side==="off"){ if(!(PLAYS[a.play]||(s.phase==="play"&&ST(a.play)))) return false; if(a.play==="FG"&&toGoal(s)+17>60) return false;
        s.pend.oc=a.play; s.pend.tempo=TEMPO[a.tempo]?a.tempo:"normal"; s.pend.ob=(a.ob==="out"||a.ob==="in")&&PLAYS[a.play]?a.ob:null; s.pend.coffin=a.play==="PUNT"&&!!a.coffin;
        if(s.phase==="play" && s.running && s.clock-preSnap(s,s.pend.tempo)<=0){ // clock expires before the snap
          snapshotPrev(s); const team=s.poss; s.clock=0; s.pend={}; s.last={txt:`${TEAMS[team].name} let the clock run out. 0:00.`,cls:"",team}; addLog(s,team,s.last.txt); endQuarter(s); afterPlay(s); s.seq=(s.seq||0)+1; return true; }
        if(NOROLL(a.play)){ resolvePending(s); return true; }
      }
      else { if(!DEFS[a.play]) return false; s.pend.dc=a.play; }
      return true; }
    case "uncall":{ // change your mind before dice
      const P=s.pend; if(P.od||P.dd) return false;
      const team=a.side==="off"?s.poss:other(s.poss); const w=callerOf(s,team); if(!(isAdmin||(w&&w.id===pid))) return false;
      if(a.side==="off") delete P.oc; else delete P.dc; return true; }
    case "roll":{
      const ns=needs(s); const n=ns.find(x=>x.kind==="roll"&&x.side===a.side); if(!n||!canAct(s,pid,n)) return false;
      if(a.side==="fol"){ const d=a.dice&&validDice(a.dice,["t","a","b"])?{t:a.dice.t,a:a.dice.a,b:a.dice.b}:{t:d6(),a:d6(),b:d6()}; resolveFollow(s,d); return true; }
      if(a.side==="off"){ const d=a.dice&&validDice(a.dice,["t","a","b"])?{t:a.dice.t,a:a.dice.a,b:a.dice.b}:{t:d6(),a:d6(),b:d6()}; s.pend.od=d; if(s.phase==="kickoff") s.pend.onside=!!a.onside; }
      else { const d=a.dice&&validDice(a.dice,["d1","d2"])?{d1:a.dice.d1,d2:a.dice.d2}:{d1:d6(),d2:d6()}; s.pend.dd=d; }
      if(needs(s).length===0) resolvePending(s);
      return true; }
  }
  return false;
}
function applySpecial(s,k){
  const team=s.poss; s.last={team,pk:k,txt:"",cls:""};
  if(k==="SPIKE"){ s.down++; s.last.txt=`${TEAMS[team].short} spikes it. Clock stopped, down used.`; }
  else { s.ball-=dir(team)*1; s.toGo+=1; s.down++; s.last.txt=`${TEAMS[team].short} takes a knee. Clock keeps running.`; }
  if(s.down>4){ s.last.txt+=" Turnover on downs."; s.poss=other(team); s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.stop=true; }
  addLog(s,team,s.last.txt);
}
const QMINS=[5,8,10,12,15]; const NQS=[2,4];
function resolvePending(s){
  const P=s.pend; snapshotPrev(s);
  const dice=Object.assign({d1:1,d2:1},P.od||{},P.dd||{});
  const used={call:[],roll:[]};
  const tempo=P.tempo||"normal";
  if(s.phase==="kickoff"){ s.running=false; applyKickoff(s,dice,P.onside); if(s.follow){ s.follow.tempo=tempo; s.follow.used=[]; s.pend={}; s.seq=(s.seq||0)+1; return; } const tb=/Touchback|TOUCHDOWN|nside/.test(s.last.txt); runClock(s,"KO",tempo,tb); }
  else if(s.phase==="pat"){
    const off=s.poss;
    if(P.pat==="XP"){ applyPAT(s,"XP",dice); used.call.push(off); used.roll.push(off); }
    else { applyPAT(s,"2PT",dice,P.oc,P.dc); used.call.push(off,other(off)); used.roll.push(off,other(off)); s.last.dice=dice; s.last.D=dice.d1+dice.d2; }
  } else {
    const off=s.poss, def=other(off);
    if(P.oc==="PUNT"){ applyPunt(s,dice,P.coffin); used.call.push(off); if(s.follow){ s.follow.tempo=tempo; s.follow.used=used.call.slice(); s.pend={}; s.seq=(s.seq||0)+1; return; } runClock(s,"PUNT",tempo,true); }
    else if(P.oc==="FG"){ applyFG(s,dice); used.call.push(off); if(s.follow){ s.follow.tempo=tempo; s.follow.used=used.call.slice(); s.pend={}; s.seq=(s.seq||0)+1; return; } runClock(s,"FG",tempo,true); }
    else if(P.oc==="SPIKE"||P.oc==="KNEEL"){ applySpecial(s,P.oc); used.call.push(off); runClock(s,P.oc,tempo,P.oc==="SPIKE"); }
    else { applyScrimmage(s,P.oc,P.dc,dice,P.ob); used.call.push(off,def); if(s.last.pk&&PLAYS[s.last.pk]) s.last.tempo=tempo;
      if(s.follow){ s.follow.tempo=tempo; s.follow.used=used.call.slice(); s.pend={}; s.seq=(s.seq||0)+1; return; }
      runClock(s,P.oc,tempo,!!s.last.stop||s.phase!=="play"); }
  }
  // advance rotations: callers and rollers of the teams that acted
  const kickT = s.last && s.last.pk==="KO" ? s.last.team : null;
  if(kickT){ s.ro[kickT]=(s.ro[kickT]||0)+1; }
  new Set(used.call.filter(Boolean)).forEach(t=>s.ci[t]=(s.ci[t]||0)+1);

  s.pend={};
  afterPlay(s);
  s.seq=(s.seq||0)+1;
}

// The follow-up roll (QT, breakaway, fumble, interception return) finishes the play.
function resolveFollow(s,dice){
  snapshotPrev(s); const f=s.follow; const tempo=f.tempo||"normal"; const used=f.used||[]; const pk=f.pk;
  applyFollow(s,dice);
  if(s.follow){ s.follow.tempo=tempo; s.follow.used=used; s.seq=(s.seq||0)+1; return; }
  runClock(s,pk,tempo,!!s.last.stop||s.phase!=="play");
  new Set(used.filter(Boolean)).forEach(t=>s.ci[t]=(s.ci[t]||0)+1);
  s.pend={}; afterPlay(s); s.seq=(s.seq||0)+1;
}

// ---------- Transport ----------
// Modes: "peer" (GitHub Pages: admin phone hosts over PeerJS), "db" (claude.ai page: shared store), "local" (one device)
const LKEY="turkeybowl57.v2";
const IDKEY="turkeybowl57.pid";
let myId=null; try{ myId=localStorage.getItem(IDKEY); }catch(e){}
if(!myId){ myId="p"+Math.random().toString(36).slice(2,10); try{localStorage.setItem(IDKEY,myId);}catch(e){} }
let S=null;          // current state as this device knows it
let mode="none";     // none | host | client | local
let net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null};
let ui={view:null,sel:null,manual:(()=>{ try{ return localStorage.getItem("tb.manual")!=="0"; }catch(e){ return true; } })(),md:{},confirm:null,tv:false,err:""};
const hasClaude=()=>!!(window.claude&&typeof window.claude.use==="function");
function saveHost(){ try{ localStorage.setItem(LKEY,JSON.stringify(S)); }catch(e){} }
function loadHost(){ try{ const j=localStorage.getItem(LKEY); return j?JSON.parse(j):null; }catch(e){ return null; } }
function freshState(code){ const s=newGame(15,4); s.code=code; s.admin=myId; s.players=[]; s.ci={KC:0,PHI:0}; s.ro={KC:0,PHI:0}; s.pend={}; s.seq=0; s.started=Date.now(); return s; }
function genCode(){ const A="BCDFGHJKLMNPQRSTVWXZ"; let c=""; for(let i=0;i<4;i++) c+=A[Math.floor(Math.random()*A.length)]; return c; }

// Public view of state sent to clients: hide the other side's call
function publicState(){ return S; }

function act(a){ // any device -> host
  ui.err="";
  if(mode==="host"||mode==="local"){ const before=S.seq; if(handleAction(S,a,myId)){ S.rev++; saveHost(); broadcast(); maybeCelebrate(before); } render(); return; }
  if(mode==="client"){
    if(net.via==="peer"&&net.hostConn&&net.hostConn.open){ net.hostConn.send({type:"act",a,pid:myId}); }
    else if(net.via==="db"&&net.db){ const ref=net.db.doc("actions/"+myId); net.actSeq=(net.actSeq||0)+1; ref.set({a:JSON.stringify(a),n:net.actSeq,t:Date.now()}).catch(()=>{ui.err="Couldn't send. Check your connection.";render();}); }
    else { ui.err="Not connected to the game yet."; render(); }
  }
}
let lastBroadcast=0;
function broadcast(){
  if(net.via==="peer"){ const msg={type:"state",s:S}; net.conns=net.conns.filter(c=>c.open||c._pending); net.conns.forEach(c=>{ try{ if(c.open) c.send(msg); }catch(e){} }); }
  if(net.via==="db"&&net.db){ const body={s:JSON.stringify(S)}; const doWrite=()=>{ net.writing=true; net.db.doc("game/state").set(body).catch(()=>{}).finally(()=>{ net.writing=false; if(net.queued){ const q=net.queued; net.queued=null; body.s=q; doWrite(); } }); }; if(net.writing){ net.queued=body.s; } else doWrite(); }
}
function maybeCelebrate(beforeSeq){ if(S&&S.seq!==beforeSeq&&S.last) celebrate(S.last); }

// --- PeerJS
const PFX="turkeybowl57-";
const peerOpts=()=>Object.assign({debug:0},window.TB_PEER||{});
const PeerCls=()=>window.TB_RELAY&&window.RelayPeer?window.RelayPeer:window.Peer;
function hostPeer(code,resume){
  if(!PeerCls()){ net.status="Live sync library didn't load. Playing on this device only."; mode="local"; render(); return; }
  net.via="peer"; mode="host"; net.code=code;
  if(!resume||!S||S.code!==code){ S=freshState(code); }
  S.host=myId; saveHost(); setHash(code);
  net.status="Opening your game…"; render();
  const peer=new (PeerCls())(PFX+code,peerOpts()); net.peer=peer;
  peer.on("open",()=>{ net.status="Live. Share the link or code."; net.live=true; render(); });
  peer.on("connection",conn=>{
    conn._pending=true; net.conns.push(conn);
    conn.on("open",()=>{ conn._pending=false; conn.send({type:"state",s:S}); render(); });
    conn.on("data",m=>{ if(!m||m.type!=="act") return; const pid=String(m.pid||"").slice(0,20); const before=S.seq; if(handleAction(S,m.a,pid)){ S.rev++; saveHost(); broadcast(); maybeCelebrate(before); render(); } else { try{conn.send({type:"nope"});}catch(e){} } });
    conn.on("close",()=>{ net.conns=net.conns.filter(c=>c!==conn); render(); });
  });
  peer.on("disconnected",()=>{ net.status="Reconnecting to the sync server…"; render(); setTimeout(()=>{ try{peer.reconnect();}catch(e){} },1500); });
  peer.on("error",err=>{
    if(err&&err.type==="unavailable-id"){ net.status="That game code is still releasing. Retrying in 5 seconds…"; render(); try{peer.destroy();}catch(e){} setTimeout(()=>hostPeer(code,true),5000); return; }
    if(err&&(err.type==="network"||err.type==="server-error"||err.type==="socket-error")){ net.status="Can't reach the sync server. The game still works on this screen."; net.live=false; render(); return; }
  });
}
function joinPeer(code){
  if(!PeerCls()){ ui.err="Live sync library didn't load on this phone. Try reloading."; render(); return; }
  net.via="peer"; mode="client"; net.code=code; setHash(code);
  net.status="Connecting to game "+code+"…"; render();
  const peer=net.peer||new (PeerCls())(undefined,peerOpts()); net.peer=peer;
  const go=()=>{
    const conn=peer.connect(PFX+code,{reliable:true}); net.hostConn=conn;
    const t=setTimeout(()=>{ if(!conn.open){ net.status="Still trying to reach the admin's phone. Make sure it has the game open."; render(); } },8000);
    conn.on("open",()=>{ clearTimeout(t); net.status="Connected"; net.live=true; render(); });
    conn.on("data",m=>{ if(m&&m.type==="state"){ const before=S&&S.seq; S=m.s; saveBackup(); net.lostAt=0; if(before!==undefined&&before!==S.seq&&S.last) celebrate(S.last); render(); } if(m&&m.type==="nope"){ ui.err="It's not your turn for that."; render(); } });
    conn.on("close",()=>{ net.live=false; net.lostAt=net.lostAt||Date.now(); net.status="Lost the admin's phone. Reconnecting…"; render(); setTimeout(go,2500); });
    conn.on("error",()=>{});
  };
  if(peer.open) go(); else peer.on("open",go);
  peer.on("error",err=>{ if(err&&err.type==="peer-unavailable"){ net.status=`No game ${code} is open right now. Check the code, or ask the admin to open the game.`; net.live=false; render(); setTimeout(go,4000); } else if(err&&(err.type==="network"||err.type==="server-error")){ net.status="Can't reach the sync server. Check your Wi-Fi."; render(); } });
}

// --- claude.ai db
async function initDb(){
  let db=null, user=null;
  try{ [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]); }catch(e){}
  if(!db){ net.dbMissing=true; render(); return; }
  net.db=db; net.via="db";
  let owner=false; try{ owner=user?!!(await user.isOwner()):false; }catch(e){}
  net.owner=owner;
  if(owner){
    mode="host"; S=loadHost()||freshState("HOME"); S.admin=myId;
    const snap0=await db.doc("game/state").get().catch(()=>null);
    if(snap0&&snap0.exists){ try{ const r=JSON.parse(snap0.data().s); if(r&&r.v===2&&(r.rev||0)>(S.rev||0)) { S=r; S.admin=myId; } }catch(e){} }
    saveHost(); broadcast(); net.live=true;
    const seen={};
    db.collection("actions").onSnapshot(q=>{ let changed=false; const before=S.seq;
      q.docs.forEach(d=>{ const b=d.data(); if(!b) return; const k=d.id; if(seen[k]===undefined){ seen[k]=b.n; if(Date.now()-(b.t||0)>15000) return; } else if(b.n<=seen[k]) return; seen[k]=b.n; try{ if(handleAction(S,JSON.parse(b.a),k)) changed=true; }catch(e){} });
      if(changed){ S.rev++; saveHost(); broadcast(); maybeCelebrate(before); render(); } },()=>{ net.status="Live sync stopped."; render(); });
  } else {
    mode="client"; net.status="Connecting…";
    const timer=setTimeout(()=>{ if(!S){ net.status="Waiting for the admin to open the game."; render(); } },10000);
    db.doc("game/state").onSnapshot(snap=>{ clearTimeout(timer); if(snap.exists){ try{ const before=S&&S.seq; S=JSON.parse(snap.data().s); net.live=true; net.status="Connected"; if(before!==undefined&&before!==S.seq&&S.last) celebrate(S.last);}catch(e){} } render(); },()=>{ net.status="Live sync stopped."; render(); });
  }
  render();
}
