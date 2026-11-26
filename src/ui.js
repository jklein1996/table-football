// ---------- Field animations + confetti ----------
const FXTXT={td:["TOUCHDOWN!","td"],fg:["IT'S GOOD!","td"],fgmiss:["NO GOOD","to"],xp:["EXTRA POINT GOOD","first"],two:["TWO-POINT GOOD!","td"],
  sack:["SACK!","to"],qt:["QB TRAPPED!","to"],brk:["BREAKAWAY!","td"],int:["INTERCEPTED!","to"],fum:["FUMBLE!","to"],turnover:["TURNOVER!","to"],
  recover:["RECOVERED!","first"],flag:["FLAG!","flag"],first:["FIRST DOWN","first"],inc:["INCOMPLETE","dim"],punt:["PUNT","dim"],kick:["KICKOFF","dim"],
  block:["BLOCKED!","to"],safety:["SAFETY!","to"],scramble:["SCRAMBLE!","first"],downs:["TURNOVER ON DOWNS","to"]};
const FX_X=a=>8.333+Math.max(-2,Math.min(102,a))*0.83333;
function celebrate(last){ if(!last) return; setTimeout(()=>{ try{ playAnim(last); }catch(e){} },40); if(last.cls==="td") confetti(last); }
function playAnim(l){
  const fieldEl=document.querySelector(".field"); if(!fieldEl||!S) return;
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  const old=document.getElementById("fx"); if(old) old.remove();
  const ev=l.ev||(l.cls==="td"?"td":l.cls==="to"?"turnover":null);
  const fx=document.createElement("div"); fx.id="fx"; fx.className="fx"+(S.ui_tv?" tv":"");
  let from=l.from!=null?l.from:S.ball, to=S.ball;
  if(S.phase==="pat"&&(ev==="td")) to=l.team==="KC"?100:0;
  if(l.wait) to=from;
  const pk=l.pk; const air=(PLAYS[pk]&&PLAYS[pk].cat==="pass"&&ev!=="sack"&&ev!=="qt"&&ev!=="scramble")||pk==="PUNT"||pk==="KO"||pk==="FG";
  if(pk==="FG"){ to=l.team==="KC"?104:-4; }
  let h="";
  if(!reduce && from!=null && to!=null && (from!==to||pk==="FG")) h+=`<div class="fxball ${air?"arc":""}" style="--x0:${FX_X(from)}%;--x1:${FX_X(to)}%"></div>`;
  if(ev==="fg"||ev==="fgmiss"||pk==="FG"){ const g=l.team==="KC"?100:0; h+=`<div class="fxpost ${ev==="fg"?"good":"miss"}" style="left:${FX_X(g)}%"></div>`; }
  if(ev==="td"){ const side=(S.score&&l.team==="KC")?"r":"l"; h+=`<div class="fxez ${side}"></div>`; }
  if(ev==="flag") h+=`<div class="fxflag">🚩</div>`;
  if(ev==="first"&&S.poss&&S.phase==="play"){ const fd=S.ball+dir(S.poss)*Math.min(S.toGo,toGoal(S)); h+=`<div class="fxline" style="left:${FX_X(fd)}%"></div>`; }
  const t=ev&&FXTXT[ev]; if(t) h+=`<div class="fxtxt ${t[1]}">${t[0]}</div>`;
  if(!h) return;
  fx.innerHTML=h; document.body.appendChild(fx);
  if(!reduce&&(ev==="sack"||ev==="qt"||ev==="fum"||ev==="block")){ fx.classList.add("shake"); }
  const t0=performance.now();
  (function pos(){ const f=document.querySelector(".field"); if(!f||!fx.isConnected){ fx.remove(); return; }
    const r=f.getBoundingClientRect(); Object.assign(fx.style,{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px"});
    if(performance.now()-t0<3000) requestAnimationFrame(pos); else fx.remove(); })();
}
function confetti(last){
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv=document.getElementById("confetti"); if(!cv) return; cv.hidden=false; const ctx=cv.getContext("2d");
  cv.width=innerWidth; cv.height=innerHeight;
  const cols=last.team==="PHI"?["#00a3ad","#c4ced3","#004c54","#fff"]:["#e31837","#ffb81c","#fff"];
  const ps=Array.from({length:140},()=>({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,r:Math.random()*6.28,c:cols[Math.floor(Math.random()*cols.length)]}));
  let f=0; (function step(){ ctx.clearRect(0,0,cv.width,cv.height); ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.1;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-4,-2,8,4);ctx.restore();}); if(++f<130)requestAnimationFrame(step); else {ctx.clearRect(0,0,cv.width,cv.height); cv.hidden=true;} })();
}

// ---------- Rendering helpers ----------
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const app=document.getElementById("app");
const ord=n=>["","1st","2nd","3rd","4th"][n]||n+"th";
const qName=s=>s.ot?"OT":`Q${s.q}`;
const me=()=>S&&S.players.find(p=>p.id===myId);
const isAdmin=()=>S&&S.admin===myId;
const playName=k=>PLAYS[k]?PLAYS[k].name:DEFS[k]?DEFS[k].name:({PUNT:"Punt",FG:"Field Goal",SPIKE:"Spike",KNEEL:"Kneel",XP:"Extra point","2PT":"Two-point try"})[k]||k;

function scoreboard(big){
  const s=S; const p=s.poss;
  const ddTxt = s.phase==="play" ? `${ord(s.down)} & ${toGoal(s)<=s.toGo?"Goal":s.toGo}` : s.phase==="pat" ? "Try after TD" : s.phase==="kickoff" ? `Kickoff · ${TEAMS[s.kicker].short} kicks` : s.phase==="over" ? "Final" : s.phase==="toss"?"Coin toss":"Pregame";
  const tos=t=>`<span class="tos" aria-label="${s.to[t]} timeouts">${[0,1,2].map(i=>`<i class="${i<s.to[t]?"on":""}"></i>`).join("")}</span>`;
  return `<div class="board ${big?"big":""}">
    <div class="team kc"><div><div class="nm">${p==="KC"&&s.phase!=="over"?'<span class="ball" title="Has the ball"></span> ':""}CHIEFS</div>${tos("KC")}</div><div class="sc" style="margin-left:auto">${s.score.KC}</div></div>
    <div class="mid"><div class="clk ${s.running?"run":""}">${fmtClock(s.clock)}</div><div class="q">${s.phase==="over"?"FINAL":qName(s)}${s.paused?" · PAUSED":""}</div></div>
    <div class="team phi"><div class="sc" style="margin-right:auto">${s.score.PHI}</div><div><div class="nm">EAGLES${p==="PHI"&&s.phase!=="over"?' <span class="ball" title="Has the ball"></span>':""}</div>${tos("PHI")}</div></div>
  </div>
  <div class="dd"><span class="chip"><b>${ddTxt}</b></span>${s.poss&&(s.phase==="play"||s.phase==="pat")?`<span class="chip">Ball on <b>${spotName(s.ball)}</b></span>`:""}<span class="chip ${s.running?"live":""}">${s.running?"Clock running":"Clock stopped"}</span>${s.untimed?`<span class="chip live">Untimed down</span>`:""}</div>`;
}
function field(big){
  const s=S; const X=a=>8.333+a*0.83333;
  let lines=""; for(let y=5;y<=95;y+=5){ const major=y%10===0; lines+=`<div class="yl ${major?"":"minor"}" style="left:${X(y)}%"></div>`; if(major){ const lab=y<=50?y:100-y; lines+=`<div class="yn top" style="left:${X(y)}%">${lab}</div><div class="yn" style="left:${X(y)}%">${lab}</div>`; } }
  lines+=`<div class="yl goal" style="left:${X(0)}%"></div><div class="yl goal" style="left:${X(100)}%"></div><div class="hash h1"></div><div class="hash h2"></div><div class="logo">LVII</div>`;
  let marks="";
  if(s.poss && (s.phase==="play"||s.phase==="pat")){
    const fd = s.ball + dir(s.poss)*Math.min(s.toGo,toGoal(s));
    marks+=`<div class="los" style="left:${X(s.ball)}%"></div>`;
    if(s.phase==="play") marks+=`<div class="fdl" style="left:${X(fd)}%"></div>`;
    marks+=`<div class="fb" style="left:${X(s.ball)}%"></div>`;
    marks+=`<div class="dirarrow" style="left:${X(s.ball)}%">${s.poss==="KC"?"KC ▶":"◀ PHI"}</div>`;
  }
  return `<div class="fieldbox"><div class="field ${big?"big":""}" role="img" aria-label="Football field. ${s.poss?TEAMS[s.poss].name+" ball on "+spotName(s.ball):""}">
    <div class="ez l"><span>CHIEFS</span></div><div class="ez r"><span>EAGLES</span></div>${lines}${marks}</div></div>`;
}
// Dice as the five colored Paydirt dice (value shown is what the die reads as).
const dstyle=k=>{ const c=DCOLS[k]||DCOLS.white; return `background:${c[1]};color:${c[2]};border-color:${c[2]==="#fff"?"#ffffff55":"#00000055"}`; };
const dname=i=>DCOLS[diceCfg(S).c[i]][0];
function dieEl(i,v,title){ return `<div class="die roll" style="${dstyle(diceCfg(S).c[i])}" title="${esc(title)}">${v}</div>`; }
function diceHTML(d,showDef){
  if(!d||!d.t) return "";
  const D=diceCfg(S);
  const o=dieEl(0,BLACK[d.t-1]*10,dname(0)+" die (tens)")+dieEl(1,WHITE[d.a-1],dname(1)+" die")+dieEl(2,BLUE[d.b-1],dname(2)+" die");
  const df=showDef&&d.d1?`<span class="tag" style="margin-left:4px">DEF</span>${dieEl(D.d[0],RED[d.d1-1],dname(D.d[0])+" die (defense, first)")}${dieEl(D.d[1],GREEN[d.d2-1],dname(D.d[1])+" die (defense, second)")}`:"";
  return `<div class="dice">${o}${df}</div>`;
}
// Color of a chart box. Black = gain, red = bad for the offense, yellow = flag, gold = breakaway/TD, dashed = incomplete.
function boxCls(c){ if(!c) return "inc";
  if(c.k==="y") return c.td?"brk":c.y<0?"red":c.y===0?"wht":"blk";
  if(c.k==="inc") return "inc";
  if(c.k==="pen") return "yel";
  if(c.k==="b"||c.k==="td") return "brk";
  if(c.k==="tb"||c.k==="ok"||c.k==="keep"||c.k==="ret"||c.k==="kret") return "blk"; if(c.k==="fc") return "wht";
  return "red"; }
const cellTxt=c=>c&&(c.k==="keep"||c.k==="lost")?fmTxt(c):boxTxt(c);
function miniBox(c){ return `<span class="mini ${boxCls(c)}">${esc(cellTxt(c))}</span>`; }
const FOLNAME={KR:"Kickoff return",PR:"Punt return",QT:"Quarterback trapped",B:"Breakaway",FUM:"Fumble recovery",INT:"Interception return",BK:"Blocked kick"};
const FOLCOL={KR:"Kickoff Return column",PR:"Punt Return column",QT:"QT column",B:"Breakaway column",FUM:"Fumble line",INT:"Interception Return column",BK:"Blocked Kick column"};
function lookupLine(l){
  if(!l||l.R==null) return "";
  let h="";
  if(l.pk&&PLAYS[l.pk]&&l.o){
    h+=`<span class="lk">${miniBox(l.o)}${TEAMS[l.team].short} chart · ${esc(PLAYS[l.pk].name)} · roll ${l.R}</span>`;
    if(l.d) h+=`<span class="lk">${miniBox(l.d)}Defense ${esc(DEFS[l.dk].short)} · roll ${l.D}</span>`;
    if(l.why) h+=`<span class="lk why">${esc(l.why)}</span>`;
  } else if(l.o){ h+=`<span class="lk">${miniBox(l.o)}${esc(playName(l.pk))} · roll ${l.R}</span>`; }
  if(l.fol) h+=`<span class="lk">${miniBox(l.fol.box)}${esc(FOLCOL[l.fol.kind])} · roll ${l.fol.R}</span>`;
  if(l.des) h+=`<span class="lk why">Sideline call: ${l.des==="out"?"get out of bounds":"stay in bounds"}.</span>`;
  if(l.coffin) h+=`<span class="lk why">Coffin-corner punt: ${COFFIN} yards shorter, out of bounds, no return.</span>`;
  return h?`<div class="lookup">${h}<button class="btn ghost sm" data-act="lookup">Show on the charts</button></div>`:"";
}
function resultBanner(){
  const l=S.last; if(!l) return `<div class="result"><div class="big">Super Bowl LVII, replayed with dice</div></div>`;
  const showDef = l.D!=null && l.dice && l.dice.d1;
  const fd = l.fol&&l.fol.dice?`<span class="tag">${esc(FOLNAME[l.fol.kind])}</span>${diceHTML(l.fol.dice,false)}`:"";
  return `<div class="result ${l.cls||""} ${l.wait?"waitroll":""}" aria-live="polite"><div class="dicewrap">${l.dice&&l.dice.t?diceHTML(l.dice,showDef):""}${fd}</div><div class="big">${esc(l.txt)}</div>${lookupLine(l)}</div>`;
}
function nm(p){ return p?esc(p.name):"the admin"; }
function waitingText(){
  const ns=needs(S); if(S.paused) return "Game paused by the admin.";
  if(!ns.length) return "";
  return ns.map(n=>{ if(n.kind==="start") return "Waiting for the admin to start the game."; if(n.kind==="toss") return "Waiting for the admin to flip the coin.";
    const w=whoFor(S,n); const T=TEAMS[n.team].name;
    if(n.side==="fol") return `${nm(w)} rolls the ${T} ${FOLNAME[n.fol].toLowerCase()} roll.`;
    return n.kind==="call"?`${nm(w)} is calling the ${T} ${n.side==="off"?"play":"defense"}.`:n.kind==="pat"?`${nm(w)} picks the ${T} try after the TD.`:`${nm(w)} rolls the ${T} ${n.side==="off"?"offense":"defense"} dice.`; }).join(" ");
}


// ---------- Odds shown before and after every roll ----------
const P1=(n,d)=>{ const v=n/d*100; return (v>0&&v<1?v.toFixed(1):Math.round(v))+"%"; };
function colStats(col){ const o={n:0,y:0,yn:0}; ROLLS.forEach(R=>{ const c=typeof col==="function"?col(R):col[R]; const w=OFFP[R]; o.n+=w;
  const k=c.k==="y"&&c.td?"tdbox":c.k; o[k]=(o[k]||0)+w; if(c.k==="y"&&!c.td){ o.y+=w*c.y; o.yn+=w; } if(c.k==="lost"&&c.td) o.losttd=(o.losttd||0)+w; }); return o; }
function playLine(team,k){ const c=colStats(CHART[team][k]); const avg=c.yn?(c.y/c.yn).toFixed(1):"0";
  if(PLAYS[k].cat==="run") return `avg ${avg} · ${P1(c.f||0,216)} fumble · ${P1(c.b||0,216)} breakaway · ${P1(c.pen||0,216)} flag`;
  return `${P1(c.yn+(c.tdbox||0),216)} catch · avg ${avg} · ${P1(c.int||0,216)} INT · ${P1(c.qt||0,216)} QT · ${P1(c.pen||0,216)} flag`; }
function puntLine(team){ const c=colStats(CHART[team].PU); return `avg ${Math.round(c.y/c.yn)} yds · ${P1(c.blk||0,216)} blocked`; }
function defLine(offT,dk){ if(!offT) return ""; const diff=ALL_OFF.map(pk=>{ const avg=DEF_ORDER.reduce((a,d)=>a+matchupEV(offT,pk,d),0)/6; return [pk,matchupEV(offT,pk,dk)-avg]; }).sort((a,b)=>a[1]-b[1]);
  return `Best vs ${diff.slice(0,2).map(x=>PLAYS[x[0]].name).join(", ")} · weak vs ${diff.slice(-2).reverse().map(x=>PLAYS[x[0]].name).join(", ")}`; }
const SUMN={f:"fumble",td:"touchdown",tdbox:"touchdown",int:"interception",inc:"incomplete",qt:"QB trapped",b:"breakaway",pen:"flag",fc:"fair catch",keep:"kept",lost:"lost",blk:"blocked",tb:"touchback",kret:"returnable",ok:"good",ng:"no good"};
function colSummary(col,ylabel){ const c=colStats(col); const parts=[];
  if(c.yn) parts.push(`${ylabel||"avg"} ${(c.y/c.yn).toFixed(1)} (${P1(c.yn,216)} of rolls)`);
  Object.keys(SUMN).forEach(k=>{ if(c[k]) parts.push(`${SUMN[k]} ${P1(c[k],216)}`); }); if(c.losttd) parts.push(`returned for a TD ${P1(c.losttd,216)}`);
  return parts.join(" · "); }
// Every roll 10-39 in a 3 x 10 grid with its odds, the rolled one outlined.
function rollGrid(cell,hiR){
  return `<div class="rg">${[1,2,3].map(t=>`<div class="rgr">${[0,1,2,3,4,5,6,7,8,9].map(u=>{ const R=t*10+u; const [txt,cls]=cell(R);
    return `<div class="rgc ${cls}${hiR===R?" hi":""}"><i>${R}</i><b>${esc(txt)}</b><small>${P1(OFFP[R],216)}</small></div>`; }).join("")}</div>`).join("")}</div>`; }
const gcell=col=>R=>{ const c=typeof col==="function"?col(R):col[R]; return [c.k==="kret"?"RET":c.k==="tb"?"TB":cellTxt(c),boxCls(c)]; };
function statsHTML(m){ const n=m.n; let g=0,gy=0,z=0,fd=0; const need=S.phase==="pat"?2:Math.min(S.toGo,toGoal(S));
  for(const k in m.ys){ const y=+k,w=m.ys[k]; if(y>0){g+=w;gy+=w*y;} else z+=w; if(y>=need) fd+=w; }
  const bFD=(m.b||0)*(need<=15?1:.8);
  const it=[[`Gain`,g,g?`avg +${(gy/g).toFixed(1)}`:""],["No gain or loss",z],["Touchdown box",m.td],["Incomplete",m.inc],["QB trapped (roll QT)",m.qt],["Breakaway (roll B)",m.b],["Interception",m.int],["Fumble",m.fum],["Flag",m.pen],["Offsetting flags",m.offset]].filter(x=>x[1]>0);
  return `<div class="odds2">${it.map(([l,w,x])=>`<span><b>${P1(w,n)}</b> ${l}${x?` <small>${x}</small>`:""}</span>`).join("")}<span class="fd"><b>${P1(fd+m.td+bFD,n)}</b> ${S.phase==="pat"?"converts":"gets the first down"} on this roll</span></div>`; }
function previewPanel(){
  const s=S; if(!s||s.phase==="over"||s.paused) return ""; const ns=needs(s); const rn=ns.find(n=>n.kind==="roll"); if(!rn) return "";
  const P=s.pend||{}; const od=P.od?offValue(P.od.t,P.od.a,P.od.b):null; let h="";
  if(s.follow){ const f=s.follow; const t=f.team;
    const col=f.kind==="FUM"?FMBOX:f.kind==="INT"?CHART[t].IR:CHART[t][f.kind];
    h=`<h2>${TEAMS[t].name} ${FOLNAME[f.kind].toLowerCase()} roll: every result</h2><div class="small">${esc(colSummary(col,f.kind==="KR"?"avg start, own":f.kind==="BK"?"avg return":"avg yards"))}</div>${rollGrid(gcell(col),null)}`;
  } else if(s.phase==="kickoff"){ const k=s.kicker, r=other(k);
    h=`<h2>${TEAMS[k].name} kickoff: every result</h2><div class="small">${s.freeKick?"Free kick after a safety: the receiving team starts at its 20 plus the roll above 10 (up to the 45).":`Deep kick: ${esc(colSummary(CHART[k].KO))}. If it's returnable, ${TEAMS[r].name} roll their Kick Return column next: ${esc(colSummary(CHART[r].KR,"avg start, own"))}.`} Onside kick: recovered on 36–39 (${P1(OFFP[36]+OFFP[37]+OFFP[38]+OFFP[39],216)}).</div>${rollGrid(gcell(CHART[k].KO),od)}<div class="tag">${TEAMS[r].name} kick return column</div>${rollGrid(gcell(CHART[r].KR),null)}`;
  } else if(P.oc==="PUNT"){ const k=s.poss, r=other(k);
    h=`<h2>${TEAMS[k].name} ${P.coffin?"coffin-corner ":""}punt: every result</h2><div class="small">${esc(colSummary(CHART[k].PU,"avg distance"))}.${P.coffin?` Coffin corner: ${COFFIN} yards shorter, out of bounds, no return; into the end zone is still a touchback.`:` Then ${TEAMS[r].name} roll their Punt Return column: ${esc(colSummary(CHART[r].PR,"avg return"))}. A 10 (blocked) goes to the Blocked Kick column.`}</div>${rollGrid(gcell(CHART[k].PU),od)}${P.coffin?"":`<div class="tag">${TEAMS[r].name} punt return column</div>${rollGrid(gcell(CHART[r].PR),null)}`}`;
  } else if(P.oc==="FG"){ const k=s.poss; const dist=toGoal(s)+17;
    h=`<h2>${TEAMS[k].name} ${dist}-yard field goal: every result</h2><div class="small">Good on ${fgChance(dist,k)}% of rolls. Each box is the longest kick that's good; green is good from here. 10 = blocked (the other team rolls the Blocked Kick column).</div>${rollGrid(R=>{ const c=CHART[k].FG[R]; return c.k==="blk"?["BLK","red"]:[String(c.y),c.y>=dist?"blk":"red"]; },od)}`;
  } else if(s.phase==="pat"&&P.pat==="XP"){ const k=s.poss;
    h=`<h2>${TEAMS[k].name} extra point: every result</h2><div class="small">${esc(colSummary(CHART[k].XP))}</div>${rollGrid(gcell(CHART[k].XP),od)}`;
  } else if(P.oc&&PLAYS[P.oc]&&P.dc){ const off=s.poss, def=other(off), pk=P.oc, dk=P.dc; const m=matchup(off,pk,dk); const rate=DEFRATE[def][dk]||0;
    const dd=P.dd?Math.min(5,defValue(P.dd.d1,P.dd.d2)+rate):null;
    h=`<h2>${TEAMS[off].short} ${esc(PLAYS[pk].name)} vs ${TEAMS[def].short} ${esc(DEFS[dk].name)}</h2><div class="small">Both calls are locked. Every result this matchup can produce, weighted by the real dice odds:</div>${statsHTML(m)}
     ${P.ob?`<div class="small">Sideline call: <b>${P.ob==="out"?"get out of bounds":"stay in bounds"}</b>.</div>`:""}
     <div class="tag">${TEAMS[off].name} offense column · ${esc(PLAYS[pk].name)}${od!=null?` · rolled ${od}`:""}</div>${rollGrid(gcell(CHART[off][pk]),od)}
     <div class="tag">${TEAMS[def].name} defense box · ${esc(DEFS[dk].name)}${rate?` (★ +1 on the defense roll)`:""}${dd!=null?` · rolled ${dd}`:""}</div>
     <div class="rg"><div class="rgr d5">${[1,2,3,4,5].map(D=>{ const c=defBox(pk,dk,D); const w=D===5&&rate?DEFP[4]+DEFP[5]:rate?(D===1?0:DEFP[D-1]):DEFP[D]; return `<div class="rgc ${boxCls(c)}${dd===D?" hi":""}"><i>${D}</i><b>${esc(boxTxt(c))}</b><small>${P1(w,36)}</small></div>`; }).join("")}</div></div>`;
  }
  return h?`<div class="panel preview">${h}</div>`:"";
}
// ---------- Your-turn panel ----------
function myTurns(){ return needs(S).filter(n=>n.team&&canAct(S,myId,n)&&(whoFor(S,n)&&whoFor(S,n).id===myId || isAdmin())); }
function turnPanel(){
  const s=S; const mine=me();
  if(s.phase==="lobby") return lobbyPanel();
  if(s.phase==="over"){ const w=s.winner; return `<div class="panel"><h2 style="font-size:32px;color:${w==="KC"?"var(--kcgold)":"var(--phi)"}">${w==="TIE"?"It's a tie!":TEAMS[w].city+" "+TEAMS[w].name+" win!"}</h2>${isAdmin()?`<button class="btn primary" data-act="confirm" data-what="newgame">Play again</button>`:`<div class="muted">Ask the admin to start a rematch.</div>`}</div>`; }
  if(s.phase==="toss") return `<div class="panel"><h2>Coin toss</h2>${isAdmin()?`<button class="btn primary big" data-act="send" data-a='{"type":"toss"}'>Flip the coin</button>`:`<div class="wait">Waiting for the admin to flip the coin.</div>`}</div>`;
  const ns=needs(s);
  const mineNs=ns.filter(n=>{ const w=whoFor(s,n); return w?w.id===myId:isAdmin(); });
  const adminCover = isAdmin()? ns.filter(n=>{const w=whoFor(s,n); return w&&w.id!==myId;}) : [];
  let out="";
  mineNs.forEach(n=>out+=actionCard(n,false));
  if(!mineNs.length) out+=`<div class="panel"><div class="wait">${esc(waitingText())||"…"}</div>${statusChips()}${timeoutRow()}</div>`;
  else { const sc=statusChips()+timeoutRow(); if(sc) out+=`<div class="panel slim">${sc}</div>`; }
  if(adminCover.length) out+=`<details class="panel"><summary>Admin: act for someone who's away</summary>${adminCover.map(n=>actionCard(n,true)).join("")}</details>`;
  out+=previewPanel();
  return out;
}
function statusChips(){
  const s=S; if(s.phase!=="play"&&!(s.phase==="pat"&&s.pend.pat==="2PT")) return "";
  const P=s.pend; const off=s.poss, def=other(off);
  const c=(ok,label)=>`<span class="chip ${ok?"ok":""}">${ok?"✓":"…"} ${label}</span>`;
  const st=P.oc&&ST(P.oc);
  return `<div class="row">${c(!!P.oc,TEAMS[off].short+" play")}${st?"":c(!!P.dc,TEAMS[def].short+" defense")}${P.oc&&!NOROLL(P.oc)?c(!!P.od,TEAMS[off].short+" dice"):""}${!st&&P.oc&&P.dc?c(!!P.dd,TEAMS[def].short+" dice"):""}</div>`;
}
function timeoutRow(){
  const s=S; const m=me(); if(s.phase!=="play"||!s.running||s.pend.od||s.pend.dd) return "";
  const t=m?m.team:(isAdmin()?null:null); const teams=t?[t]:isAdmin()?["KC","PHI"]:[];
  return teams.filter(x=>s.to[x]>0).map(x=>`<button class="btn small" data-act="confirm" data-what="timeout" data-team="${x}">Call ${TEAMS[x].short} timeout (${s.to[x]} left)</button>`).join(" ");
}
function actionCard(n,asAdmin){
  const s=S; const T=TEAMS[n.team]; const tag=asAdmin?`<div class="tag">Acting for ${nm(whoFor(s,n))}</div>`:"";
  if(n.kind==="pat") return `<div class="panel ${T.cls} turn">${tag}<h2>Your call: the try</h2><div class="row"><button class="btn primary" data-act="send" data-a='{"type":"pat","k":"XP"}'>Kick extra point (+1)</button><button class="btn" data-act="send" data-a='{"type":"pat","k":"2PT"}'>Go for two (+2)</button></div></div>`;
  if(n.kind==="call"){
    const key=n.team+n.side; const sel=ui.sel&&ui.sel.key===key?ui.sel.play:null;
    let sheet="";
    if(n.side==="off"){
      const dist=toGoal(s)+17; const tempo=ui.tempo||"normal";
      const hud=s.running?(TEMPO[tempo]||TEMPO.normal).secs:0, use=hud+10, left=s.clock-use;
      const warn=s.running&&s.clock-hud<=0?`<div class="clockwarn bad">⚠ The clock runs out before the snap. Call a timeout or pick Hurry-up.</div>`:left<=0?`<div class="clockwarn">⚠ Last play of the ${s.q>=s.nq?"game":"quarter"}: this snap uses the rest of the clock.</div>`:"";
      sheet=`<div class="clockbox"><div><b>${fmtClock(s.clock)}</b> left · clock ${s.running?"running":"stopped"}</div><div class="small">This snap uses <b>${use}s</b>${s.running?` (${hud}s huddle + 10s play)`:" (10s play)"}, leaving <b>${fmtClock(Math.max(0,left))}</b>. If the play ends in bounds, the clock keeps running and the next huddle costs more.</div>${warn}</div>
      <div class="tag">Tempo (how much clock runs before the snap)</div><div class="seg">${Object.keys(TEMPO).map(k=>`<button class="${tempo===k?"on":""}" data-act="tempo" data-k="${k}">${TEMPO[k].name}<small>${s.running?`−${TEMPO[k].secs}s`:"clock stopped"}</small></button>`).join("")}</div>
      <div class="tag">Sideline call (runs and passes)</div><div class="seg">${[["","Normal","play it as it comes"],["out","Get out of bounds","clock stops, −5 yds"],["in","Stay in bounds","clock runs, −5 on * boxes"]].map(([k,nm2,sub])=>`<button class="${(ui.obd||"")===k?"on":""}" data-act="obd" data-k="${k}">${nm2}<small>${sub}</small></button>`).join("")}</div>
      <div class="plays">${ALL_OFF.map(k=>{const r=RATE[n.team][k]||0;return `<button class="play ${sel===k?"sel":""}" data-act="pick" data-key="${key}" data-play="${k}"><b>${PLAYS[k].n} · ${PLAYS[k].name}</b><span class="s">${PLAYS[k].desc}</span><span class="s st">${playLine(n.team,k)}</span><span class="s clk">⏱ stops the clock ~${clockStopPct(n.team,k)}%</span>${r>0?'<span class="stars">★ team strength</span>':""}</button>`;}).join("")}
      ${s.phase==="play"?`<button class="play ${sel==="PUNT"?"sel":""}" data-act="pick" data-key="${key}" data-play="PUNT"><b>Punt</b><span class="s">${s.down===4?"Smart on 4th down":"Any down"}</span><span class="s st">${puntLine(n.team)}</span></button>
      <button class="play ${sel==="FG"?"sel":""}" data-act="pick" data-key="${key}" data-play="FG" ${dist<=64?"":"disabled"}><b>Field Goal</b><span class="s">${dist<=64?`${dist} yds · ${fgChance(dist,n.team)}% good · ${pct(OFFP[10])} blocked`:"Too far"}</span></button>
      <button class="play ${sel==="SPIKE"?"sel":""}" data-act="pick" data-key="${key}" data-play="SPIKE"><b>Spike</b><span class="s">Stop the clock, lose a down</span></button>
      <button class="play ${sel==="KNEEL"?"sel":""}" data-act="pick" data-key="${key}" data-play="KNEEL"><b>Kneel</b><span class="s">Lose 1, keep clock running</span></button>`:""}</div>
      ${sel&&PLAYS[sel]?`<div class="tag">${esc(PLAYS[sel].name)}: every roll and what it gives you</div>${rollGrid(gcell(CHART[n.team][sel]),null)}<div class="small"><b>${esc(playLine(n.team,sel))}</b></div>`:""}
      ${sel==="PUNT"?`<div class="tag">Punt type</div><div class="seg">${[["","Normal punt","they roll a return"],["1","Coffin corner",`${COFFIN} yds shorter, no return`]].map(([k,nm2,sub])=>`<button class="${(ui.coffin?"1":"")===k?"on":""}" data-act="coffin" data-k="${k}">${nm2}<small>${sub}</small></button>`).join("")}</div>`:""}`;
    } else {
      sheet=`<div class="plays">${DEF_ORDER.map(k=>{const r=DEFRATE[n.team][k];return `<button class="play def ${sel===k?"sel":""}" data-act="pick" data-key="${key}" data-play="${k}"><b>${DEFS[k].name}</b><span class="s">${DEFS[k].desc}</span><span class="s st">${defLine(s.poss,k)}</span>${r>0?'<span class="stars">★ team strength: +1 on your defense roll</span>':""}</button>`;}).join("")}</div>`;
    }
    const a=JSON.stringify({type:"call",side:n.side,play:sel,tempo:ui.tempo||"normal",ob:ui.obd||"",coffin:!!ui.coffin});
    return `<div class="panel ${T.cls} turn">${tag}<h2>Your call: ${T.name} ${n.side==="off"?"offense":"defense"}</h2><div class="small muted">${n.side==="off"?`${ord(s.down)} & ${toGoal(s)<=s.toGo?"Goal":s.toGo} at ${spotName(s.ball)}. Keep your phone hidden from the other team.`:`Guess what ${TEAMS[s.poss].name} will run.`}</div>${sheet}
      <button class="btn primary big" data-act="send" data-a='${esc(a)}' ${sel?"":"disabled"}>Lock in ${sel?esc(playName(sel)):"call"}</button></div>`;
  }
  if(n.kind==="roll"){
    const fol=n.side==="fol"; const off=n.side!=="def"; const isKO=s.phase==="kickoff"; const md=ui.md; const keys=off?["t","a","b"]:["d1","d2"];
    const ready=keys.every(k=>md[k]);
    const DC=diceCfg(s); const face=(k,label,ci,map,mul)=>`<label><span><span class="die sm" style="${dstyle(DC.c[ci])}"></span> ${label}</span><span class="faces">${[1,2,3,4,5,6].map(v=>`<button data-act="face" data-k="${k}" data-v="${v}" class="${md[k]===v?"on":""}" aria-label="${label} face ${v}">${v}<small>=${map[v-1]*(mul||1)}</small></button>`).join("")}</span></label>`;
    const what=fol?FOLNAME[n.fol].toLowerCase()+" roll":s.phase==="kickoff"?"kickoff":S.pend.oc==="PUNT"?"punt":S.pend.oc==="FG"?"field goal":S.pend.pat==="XP"?"extra point":off?"offense":"defense";
    const folNote=fol?`<div class="small">${n.fol==="KR"?"The kick is coming down. Roll your Kickoff Return column to see where you start.":n.fol==="PR"?"The punt is coming down. Roll your Punt Return column: fair catch, a return, or a muff.":n.fol==="QT"?"The pass rush got there. Roll to see what the quarterback does (QT column).":n.fol==="B"?"He's loose! Roll to see how far he goes (Breakaway column).":n.fol==="FUM"?"Ball's on the ground! Roll the fumble line: 10–28 you keep it.":n.fol==="BK"?"Blocked! Roll the Blocked Kick column to see if you scoop it up and run.":"Picked off! Roll your Interception Return column."}</div>`:"";
    const manual=ui.manual?`<div class="manual">${off?face("t",dname(0)+" die (tens)",0,BLACK,10)+face("a",dname(1)+" die",1,WHITE)+face("b",dname(2)+" die",2,BLUE):face("d1",dname(DC.d[0])+" die",DC.d[0],RED)+face("d2",dname(DC.d[1])+" die",DC.d[1],GREEN)}</div>
      <button class="btn primary big" data-act="send" data-a='${esc(JSON.stringify({type:"roll",side:n.side,onside:isKO&&!!ui.onside,dice:Object.fromEntries(keys.map(k=>[k,md[k]||0]))}))}' ${ready?"":"disabled"}>Submit my dice</button>`:
      `<button class="btn primary big" data-act="send" data-a='${esc(JSON.stringify({type:"roll",side:n.side,onside:isKO&&!!ui.onside}))}'>🎲 ${isKO&&ui.onside?"Onside kick: roll":"Roll"} ${off?`all 3 dice`:`the ${dname(diceCfg(s).d[0]).toLowerCase()} & ${dname(diceCfg(s).d[1]).toLowerCase()} dice`}</button>`;
    return `<div class="panel ${T.cls} turn">${tag}<h2>Your roll: ${T.name} ${what}</h2>${folNote}${isKO?`<label class="row small"><input type="checkbox" id="onside" ${ui.onside?"checked":""}> Onside kick (you recover on 36–39, about 1 in 7; otherwise they get it at your 45)</label>`:""}<label class="row small muted"><input type="checkbox" id="manualdice" ${ui.manual?"checked":""}> I'm rolling real dice</label>${manual}</div>`;
  }
  return "";
}

// ---------- Lobby / team ----------
function rosterCol(team){
  const L=teamList(S,team); const s=S;
  const c=callerOf(s,team), r=rollerOf(s,team);
  return `<div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} <span class="muted small">${L.length} player${L.length===1?"":"s"}</span></h2>
   <ol class="roster">${L.map((p,i)=>`<li><span>${esc(p.name)}${p.id===myId?' <span class="tag">you</span>':""}${p.id===s.admin?' <span class="tag">admin</span>':""}</span><span class="roles">${s.phase!=="lobby"&&c&&c.id===p.id?'<span class="pill">calls next</span>':""}${s.phase!=="lobby"&&r&&r.id===p.id?'<span class="pill r">rolls next</span>':""}</span>${isAdmin()?`<span class="adm"><button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"up",pid:p.id}))}' title="Move up" aria-label="Move ${esc(p.name)} up">↑</button><button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"move",pid:p.id}))}' title="Switch team" aria-label="Switch ${esc(p.name)} to other team">⇄</button>${p.id!==s.admin?`<button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"admin",pid:p.id}))}' title="Make admin" aria-label="Make ${esc(p.name)} the admin">👑</button>`:""}<button class="mini" data-act="confirm" data-what="kick" data-pid="${esc(p.id)}" title="Remove" aria-label="Remove ${esc(p.name)}">✕</button></span>`:""}</li>`).join("")||'<li class="muted">No one yet</li>'}</ol>
   ${s.phase!=="lobby"&&isAdmin()&&L.length>1?`<div class="row"><button class="btn small" data-act="send" data-a='${esc(JSON.stringify({type:"skip",team,which:"call"}))}'>Skip caller</button><button class="btn small" data-act="send" data-a='${esc(JSON.stringify({type:"skip",team,which:"roll"}))}'>Skip roller</button></div>`:""}</div>`;
}
function joinBox(){
  const m=me(); const name=ui.name!=null?ui.name:(m?m.name:(localGet("tb.name")||""));
  return `<div class="panel"><h2>${m?"Your team":"Join a team"}</h2>
    <label class="small muted" for="pname">Your name</label><input id="pname" class="inp" maxlength="18" value="${esc(name)}" autocomplete="off">
    <div class="row btns"><button class="btn team-kc ${m&&m.team==="KC"?"on":""}" data-act="join" data-team="KC">Join Chiefs</button><button class="btn team-phi ${m&&m.team==="PHI"?"on":""}" data-act="join" data-team="PHI">Join Eagles</button>${m?`<button class="btn ghost small" data-act="send" data-a='{"type":"leave"}'>Leave team</button>`:""}</div>
    <div class="small muted">Turns rotate in the order players joined. The admin can reorder.</div></div>`;
}
function lobbyPanel(){
  return `${(isAdmin()||mode==="host")&&mode!=="local"?`<div class="panel"><h2>Invite players</h2><div class="small muted">Show this screen around. Everyone scans the QR, taps Join as a player, and picks a team. They wait here until you start.</div>${shareBox()}${mode==="host"?`<div class="note small"><b>Hosting on a computer?</b> Leave this tab open; it runs the game for everyone. Join on your phone, then tap 👑 next to your name here to make your phone the admin.${!isAdmin()?" Admin has been handed to a phone.":""}</div>`:""}</div>`:""}${joinBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>${isAdmin()?settingsBox()+diceBox()+`<button class="btn primary big" data-act="send" data-a='{"type":"start"}'>Start the game</button>`:`<div class="wait">Waiting for the admin to start.</div>`}`;
}
function diceBox(){
  const D=diceCfg(S); const pairs=[[1,2],[0,1],[0,2]];
  const sel=(i)=>`<select class="btn" data-dice="${i}" aria-label="Color of die ${i+1}">${Object.keys(DCOLS).map(k=>`<option value="${k}" ${D.c[i]===k?"selected":""}>${DCOLS[k][0]}</option>`).join("")}</select>`;
  return `<div class="panel"><h2>Your dice</h2><div class="small muted">Pick the colors of the 3 dice at the table. Both teams roll the same dice.</div>
   <div class="dicecfg">${[0,1,2].map(i=>`<label><span class="die sm" style="${dstyle(D.c[i])}"></span> Die ${i+1} <small>${i===0?"tens: 1=10, 2–3=20, 4–6=30":i===1?"ones: face − 1 (0–5)":"ones: 1–2=0, then face − 2 (0–4)"}</small>${sel(i)}</label>`).join("")}</div>
   <label class="small muted" for="dicedef">Defense rolls these two</label><select id="dicedef" class="btn">${pairs.map(([a,b])=>`<option value="${a}${b}" ${D.d[0]===a&&D.d[1]===b?"selected":""}>${DCOLS[D.c[a]][0]} (die ${a+1}) + ${DCOLS[D.c[b]][0]} (die ${b+1})</option>`).join("")}</select>
   <div class="small muted">Defense: first die 1–3 = 1, 4–5 = 2, 6 = 3; second die 1–4 = 0, 5 = 1, 6 = 2. Add them (1–5). Prefer the app to roll? Just tap Roll.</div></div>`;
}
function settingsBox(){
  const s=S; const locked=!(s.phase==="lobby"||s.phase==="toss");
  return `<div class="panel"><h2>Game length</h2><div class="row"><label class="small muted" for="nq">Quarters</label><select id="nq" class="btn">${NQS.map(n=>`<option value="${n}" ${s.nq===n?"selected":""}>${n}</option>`).join("")}</select>
   <label class="small muted" for="qmin">Minutes per quarter</label><select id="qmin" class="btn" ${locked?"disabled":""}>${QMINS.map(n=>`<option value="${n}" ${s.qmin===n?"selected":""}>${n} min</option>`).join("")}</select></div>
   <div class="small muted">About ${Math.round(s.nq*s.qmin*2)} snaps and kicks, roughly ${Math.round(s.nq*s.qmin*2*40/60/5)*5} minutes at the table. 15 minutes is the real Paydirt length; pick 5 or 8 for a quicker game.</div></div>`;
}

// ---------- Playbook / rules ----------
// ---------- Paydirt-style charts ----------
function boxTD(c,hi){ const t=cellTxt(c); return `<td class="bx ${boxCls(c)}${hi?" hi":""}"><b>${esc(t)}</b>${c&&c.ob?`<u>*</u>`:""}</td>`; }
const pct=n=>(Math.round(n/216*1000)/10)+"%";
// Odds line under each offense column, straight from the boxes.
function colOdds(team,pk){
  let comp=0,yd=0,inc=0,qt=0,to=0,b=0,pen=0; ROLLS.forEach(R=>{ const c=CHART[team][pk][R],w=OFFP[R];
    if(c.k==="y"){comp+=w;yd+=w*c.y;} else if(c.k==="inc")inc+=w; else if(c.k==="qt")qt+=w; else if(c.k==="int"||c.k==="f")to+=w; else if(c.k==="b")b+=w; else pen+=w; });
  const pass=PLAYS[pk].cat==="pass";
  return `${pass?`${pct(comp)} catch`:`avg ${(yd/comp).toFixed(1)}`}<br>${pass?`avg ${(yd/comp).toFixed(1)}`:`${pct(to)} fum`}${pass?`<br>${pct(inc)} inc<br>${pct(qt)} QT<br>${pct(to)} INT`:""}<br>${pct(b)} B`;
}
function offChart(team,hl,only){
  const cols=only||ALL_OFF.concat(["QT","B"]);
  const name=k=>PLAYS[k]?`${PLAYS[k].n} · ${PLAYS[k].name}${RATE[team][k]>0?" ★":""}`:k==="QT"?"QT · QB trapped":"B · Breakaway";
  return `<div class="pd"><table><thead><tr><th class="rk">Roll</th><th class="pr">Odds</th>${cols.map(k=>`<th class="${hl&&(hl.pk===k||hl.fol===k)?"hc":""} ${PLAYS[k]?"":"xc"}">${name(k)}</th>`).join("")}</tr></thead><tbody>
  ${ROLLS.map(R=>`<tr class="${R%10===0?"dec":""}${hl&&(hl.R===R||hl.FR===R)?" hr":""}"><th class="rk">${R}</th><td class="pr">${OFFP[R]}</td>${cols.map(k=>boxTD(CHART[team][k][R],hl&&((hl.R===R&&hl.pk===k)||(hl.FR===R&&hl.fol===k)))).join("")}</tr>`).join("")}
  <tr class="odds"><th class="rk">Odds</th><td class="pr">of 216</td>${cols.map(k=>`<td>${PLAYS[k]?colOdds(team,k):esc(colSummary(CHART[team][k],"avg")).split(" · ").join("<br>")}</td>`).join("")}</tr>
  </tbody></table></div>`;
}
function stChart(team,hl,only){
  let cols=[["KO","Kickoff (kicker rolls)"],["KR","Kick return (receiver rolls)"],["PU","Punt (kicker rolls)"],["PR","Punt return (receiver rolls)"],["FG","Field goal (good up to)"],["XP","Extra point"],["IR","Interception return"],["FM","Fumble recovery"],["BK","Blocked kick (blockers roll)"]];
  if(only) cols=cols.filter(c=>only.includes(c[0]));
  const cellOf=(k,R)=>k==="FM"?FMBOX(R):CHART[team][k][R];
  const isH=(k,R)=>hl&&((hl.col===k&&hl.R===R)||(hl.fcol===k&&hl.FR===R));
  return `<div class="pd"><table><thead><tr><th class="rk">Roll</th><th class="pr">Odds</th>${cols.map(([k,n])=>`<th class="${hl&&(hl.col===k||hl.fcol===k)?"hc":""}">${n}</th>`).join("")}</tr></thead><tbody>
  ${ROLLS.map(R=>`<tr class="${R%10===0?"dec":""}${hl&&(hl.R===R||hl.FR===R)?" hr":""}"><th class="rk">${R}</th><td class="pr">${OFFP[R]}</td>${cols.map(([k])=>boxTD(cellOf(k,R),isH(k,R))).join("")}</tr>`).join("")}
  <tr class="odds"><th class="rk">Odds</th><td class="pr">of 216</td>${cols.map(([k])=>`<td>${esc(colSummary(R=>cellOf(k,R))).split(" · ").join("<br>")}</td>`).join("")}</tr></tbody></table></div>`;
}
function defChart(dk,hl,team){
  const Ds=[1,2,3,4,5];
  return `<div class="pd dc"><table><thead><tr><th class="rk">Play</th>${Ds.map(D=>`<th class="${hl&&hl.D===D?"hc":""}">${D}<small>${Math.round(DEFP[D]/36*100)}%</small></th>`).join("")}</tr></thead><tbody>
  ${ALL_OFF.map(pk=>`<tr class="${hl&&hl.pk===pk?"hr":""}"><th class="rk">${PLAYS[pk].n} · ${PLAYS[pk].name}</th>${Ds.map(D=>boxTD(defBox(pk,dk,D),hl&&hl.pk===pk&&hl.D===D)).join("")}</tr>`).join("")}
  </tbody></table></div>`;
}
function playbookView(){
  const m=me(); const l=S&&S.last; const myT=m&&m.team;
  // Players only see their own team's sheet for the side they're on right now.
  const locked=!!(myT&&S&&S.phase!=="lobby"&&mode!=="local");
  const side=!locked?null:(ui.pbHL&&l&&l.team&&l.pk&&PLAYS[l.pk])?(l.team===myT?"off":"def"):(!S.poss||S.poss===myT?"off":"def");
  const team=locked?(side==="off"?myT:other(myT)):(ui.pbTeam||(m?m.team:"KC")); const def=other(team);
  const allowed=!locked?["off","def","st","how"]:side==="off"?["off","st","how"]:["def","st","how"];
  const dk=ui.pbDef||"A"; const sub=allowed.includes(ui.pbSub)?ui.pbSub:allowed[0];
  const stT=locked?myT:team;
  const SUBN={off:"Offense chart",def:"Defense chart",st:"Kicks & returns",how:"How to read"};
  const okL=ui.pbHL&&l&&l.team===team&&l.pk&&PLAYS[l.pk];
  const hlO=okL?{R:l.R,pk:l.pk,FR:l.fol&&(l.fol.kind==="QT"||l.fol.kind==="B")?l.fol.R:null,fol:l.fol?l.fol.kind:null}:null;
  const hlD=okL&&l.dk===dk?{D:l.D,pk:l.pk}:null;
  const STC={KO:"KO",PUNT:"PU",FG:"FG",XP:"XP"}, FCOL={KR:"KR",PR:"PR",INT:"IR",FUM:"FM",BK:"BK"};
  const stL=ui.pbHL&&l&&l.R!=null&&(STC[l.pk]||(l.fol&&FCOL[l.fol.kind]));
  const hlS=stL?{col:STC[l.pk],R:STC[l.pk]?l.R:null,fcol:l.fol&&FCOL[l.fol.kind],FR:l.fol&&l.fol.R}:null;
  return `${locked?`<div class="panel slim ${TEAMS[myT].cls}"><div class="small"><b>${TEAMS[myT].name} ${side==="off"?"on offense":"on defense"}.</b> ${side==="off"?"You see your offense chart. Your defense chart shows up when the other team has the ball.":"You see your defense chart. Your offense chart shows up when you get the ball back."}</div></div>`:`<div class="seg wide">${["KC","PHI"].map(t=>`<button class="${team===t?"on":""}" data-act="pb" data-t="${t}">${TEAMS[t].name} on offense</button>`).join("")}</div>`}
   ${okL||stL?`<div class="panel slim">${lookupLine(l).replace(/<button[^>]*>.*?<\/button>/,`<button class="btn ghost sm" data-act="pbclear">Clear highlight</button>`)}</div>`:""}
   <div class="seg">${allowed.map(k=>`<button class="${sub===k?"on":""}" data-act="pbsub" data-k="${k}">${SUBN[k]}</button>`).join("")}</div>
   ${sub==="off"?(ui.pbOne?offByPlay(team,hlO):offSheet(team,hlO,hlS)):""}
   ${sub==="def"&&ui.pbOne?defByDef(team,dk,hlD):""}
   ${sub==="def"&&!ui.pbOne?`<div class="panel"><h2>${TEAMS[def].name} defense chart</h2>
    <div class="seg">${DEF_ORDER.map(d=>`<button class="${dk===d?"on":""}" data-act="pbdef" data-d="${d}">${DEFS[d].name}</button>`).join("")}</div>
    <div class="small">${esc(DEFS[dk].desc)}. Find the play down the left and the defense roll (red + green, 1–5) across the top.${DEFRATE[def][dk]?` ${TEAMS[def].name} ★ ${DEFS[dk].short}: add 1 to the defense roll (max 5).`:""}</div>
    ${zoomBar()}<div class="zoomwrap" style="zoom:${ui.pbZoom||1}">${defChart(dk,hlD,team)}</div>
    <div class="tag">What ${TEAMS[team].name} get against ${esc(DEFS[dk].name)}</div>
    <div class="tbl"><table class="vs">${VSHEAD("Play")}<tbody>${ALL_OFF.map(pk=>vsRow(matchup(team,pk,dk),esc(PLAYS[pk].name),10)).join("")}</tbody></table></div>
    ${legend()}<button class="btn small" data-act="pbone" data-k="1">Show one formation at a time</button></div>`:""}
   ${sub==="st"?`<div class="panel ${TEAMS[stT].cls}"><h2>${TEAMS[stT].name} kicks & returns</h2><div class="small">Roll the offense dice (black + white + blue). The box is the final result; don't use the defense chart.</div>${stChart(stT,hlS)}</div>`:""}
   ${sub==="how"?howToRead():""}`;
}
// The classic Paydirt sheet, split into tabs so each fits a phone: Running, Passing, QB trapped & Breakaway, Special teams.
const PBCAT={run:["Running",["LP","OT","ER","DR","QS"]],pass:["Passing",["SC","SP","MP","LG","SL","HM"]],qt:["QB trapped & Breakaway",["QT","B"]],st:["Special teams",null]};
function zoomBar(){ if(!ui.pbZoom) ui.pbZoom=innerWidth<500?0.85:1; const z=ui.pbZoom; return `<div class="zoombar"><span class="small muted">Zoom</span><button class="btn small" data-act="pbzoom" data-k="-1" aria-label="Zoom out">−</button><span class="small">${Math.round(z*100)}%</span><button class="btn small" data-act="pbzoom" data-k="1" aria-label="Zoom in">+</button><span class="small muted">Scroll the sheet sideways and down. Pinch works too.</span></div>`; }
function offSheet(team,hl,hlS){
  const cat=PBCAT[ui.pbCat]?ui.pbCat:(hl&&hl.pk&&PBCAT.pass[1].includes(hl.pk)?"pass":hlS?"st":"run");
  const body=cat==="st"?stChart(team,hlS):offChart(team,hl,PBCAT[cat][1]);
  const note=cat==="run"?"Runs and the QB sneak. Find your roll (10–39) down the left, your play across the top.":cat==="pass"?"Passes and the Hail Mary. Long black runs are incompletes, like the real sheet.":cat==="qt"?"Rolled only after a QT or B box: QT when the pass rush gets there (sack, throw-away, scramble, strip-sack), B when the runner breaks free.":"Kicks and returns. The kicking team rolls Kickoff or Punt, the receiving team rolls the Return column; the box is final, no defense chart.";
  return `<div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} offense sheet</h2>
   <div class="seg wrap4">${Object.keys(PBCAT).map(k=>`<button class="${cat===k?"on":""}" data-act="pbcat" data-k="${k}">${PBCAT[k][0]}</button>`).join("")}</div>
   <div class="small">${note} Odds = how many of the 216 dice combinations make that roll; the bottom row sums up each column.</div>
   ${zoomBar()}<div class="zoomwrap" style="zoom:${ui.pbZoom||1}">${body}</div>${legend()}
   <button class="btn small" data-act="pbone" data-k="1">Show one play at a time, with odds vs each defense</button></div>`;
}
// Phone view of the playbook: one play at a time, every roll with its number and odds,
// then how that play does against each defense.
const PBCOLS=()=>ALL_OFF.concat(["QT","B"]);
function vsRow(m,lab,need){ let g=0,gy=0,fd=0; for(const k in m.ys){ const y=+k,w=m.ys[k]; if(y>0){g+=w;gy+=w*y;} if(y>=need) fd+=w; }
  const n=m.n; return `<tr><th>${lab}</th><td>${P1(g+m.td,n)}</td><td>${g?(gy/g).toFixed(1):"–"}</td><td>${P1(fd+m.td+m.b,n)}</td><td>${P1(m.inc,n)}</td><td>${P1(m.qt,n)}</td><td>${P1(m.b+m.td,n)}</td><td>${P1(m.int+m.fum,n)}</td><td>${P1(m.pen,n)}</td></tr>`; }
const VSHEAD=first=>`<thead><tr><th>${first}</th><th>Gain</th><th>Avg</th><th>10+</th><th>Inc</th><th>QT</th><th>Big</th><th>TO</th><th>Flag</th></tr></thead>`;
function offByPlay(team,hl){
  const cols=PBCOLS(); const pk=cols.includes(ui.pbPlay)?ui.pbPlay:(hl&&hl.pk)||"LP"; const isPlay=!!PLAYS[pk];
  const name=k=>PLAYS[k]?PLAYS[k].name:k==="QT"?"QB trapped":"Breakaway";
  const hiR=hl?(hl.pk===pk?hl.R:hl.fol===pk?hl.FR:null):null;
  return `<div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} offense: one play at a time</h2>
   <div class="chips">${cols.map(k=>`<button class="${pk===k?"on":""}" data-act="pbplay" data-k="${k}">${PLAYS[k]?PLAYS[k].n+" ":""}${esc(name(k))}${RATE[team][k]>0?" ★":""}</button>`).join("")}</div>
   <h2 style="margin-top:10px">${esc(name(pk))}</h2><div class="small">${isPlay?esc(PLAYS[pk].desc)+". ":pk==="QT"?"Rolled after a QT box: sack, throw-away, scramble or strip-sack. ":"Rolled after a B box: how far he goes. "}<b>${isPlay?esc(playLine(team,pk)):esc(colSummary(CHART[team][pk],"avg yards"))}</b></div>
   <div class="tag">Your roll (10–39) → what the box says · % = chance of that roll</div>
   ${rollGrid(gcell(CHART[team][pk]),hiR)}
   ${isPlay?`<div class="tag">${esc(name(pk))} against each defense (the defense box is added in, real dice odds)</div>
   <div class="tbl"><table class="vs">${VSHEAD("vs")}<tbody>${DEF_ORDER.map(d=>vsRow(matchup(team,pk,d),DEFS[d].short+(DEFRATE[other(team)][d]?"★":""),10)).join("")}</tbody></table></div>
   <div class="small muted">Gain = chance of any gain. 10+ = chance of 10 or more yards on this roll, counting touchdowns and breakaways. Inc = incomplete. QT = QB trapped. Big = breakaway or touchdown box. TO = turnover (interception or fumble). ★ = the other team's strength.</div>`:""}
   ${legend()}<button class="btn small" data-act="pbone" data-k="0">◀ Back to the full sheet</button></div>`;
}
function defByDef(team,dk,hl){
  const def=other(team); const rate=DEFRATE[def][dk]||0;
  const w=D=>D===5&&rate?DEFP[4]+DEFP[5]:rate?(D===1?0:DEFP[D-1]):DEFP[D];
  return `<div class="panel"><h2>${TEAMS[def].name} defense: one formation at a time</h2>
   <div class="chips">${DEF_ORDER.map(d=>`<button class="${dk===d?"on":""}" data-act="pbdef" data-d="${d}">${esc(DEFS[d].name)}${DEFRATE[def][d]?" ★":""}</button>`).join("")}</div>
   <div class="small" style="margin-top:8px">${esc(DEFS[dk].desc)}. <b>${esc(defLine(team,dk))}</b>${rate?` · ★ your strength: +1 on the defense roll.`:""}</div>
   <div class="tag">What your roll (1–5) does to each play · % = chance of that roll</div>
   ${ALL_OFF.map(pk=>`<div class="drow ${hl&&hl.pk===pk?"hr":""}"><div class="dn">${PLAYS[pk].n} · ${esc(PLAYS[pk].name)}</div><div class="rgr d5">${[1,2,3,4,5].map(D=>{ const c=defBox(pk,dk,D); return `<div class="rgc ${boxCls(c)}${hl&&hl.pk===pk&&hl.D===D?" hi":""}"><i>${D}</i><b>${esc(boxTxt(c))}</b><small>${P1(w(D),36)}</small></div>`; }).join("")}</div></div>`).join("")}
   <div class="tag">What ${TEAMS[team].name} get against ${esc(DEFS[dk].name)}</div>
   <div class="tbl"><table class="vs">${VSHEAD("Play")}<tbody>${ALL_OFF.map(pk=>vsRow(matchup(team,pk,dk),esc(PLAYS[pk].name),10)).join("")}</tbody></table></div>
   ${legend()}<button class="btn small" data-act="pbone" data-k="0">◀ Back to the full sheet</button></div>`;
}
function legend(){ return `<div class="legend small"><span><span class="mini blk">+6</span> gain</span><span><span class="mini wht">0</span> no gain</span><span><span class="mini red">−3</span> loss / turnover / QT</span><span><span class="mini yel">DEF 5</span> flag</span><span><span class="mini brk">B</span> breakaway</span><span><span class="mini inc">INC</span> black = incomplete</span><span>( ) overrules the other box</span><span><u>*</u> out of bounds / auto first down</span><span>★ team strength</span></div>`; }
function howToRead(){
  return `<div class="panel"><h2>Reading a play, step by step</h2><ol class="small">
   <li><b>Offense box.</b> Offense chart, called play, offense roll (10–39).</li>
   <li><b>Defense box.</b> Defense chart, the defense that was called, play row, defense roll (1–5).</li>
   <li><b>Who wins:</b>
    <ul><li>Check in this order, like the real Paydirt priority chart:</li>
    <li>1. A <b>flag</b> (OFF, DEF, PI) always comes first. 2. Then an offense <b>F</b> (fumble).</li>
    <li>3. Then anything special in the <b>defense</b> box: <b>(TD)</b>, a number in <b>( )</b>, <b>QT</b>, a black box (incomplete, or no gain on a run), or <b>INT</b>. It overrules the offense box.</li>
    <li>4. Then the offense box: <b>B</b>, <b>QT</b>, <b>INT</b>, black (incomplete), or a number in ( ).</li>
    <li>5. Two plain numbers: <b>add them</b>.</li></ul></li>
   <li><b>Follow-up rolls.</b> QT → offense rolls again on its QT column (sack, throw-away, scramble or strip-sack). B → offense rolls on its Breakaway column. INT → the defense rolls on its Interception Return column. F → the team that fumbled rolls the fumble line (KEEP on 10–28, LOST on 29–39; 34–38 is returned 5 to 30 yards, 39 all the way).</li>
   <li><b>Flags.</b> OFF = against the offense, DEF/PI = against the defense. * = automatic first down. The app rolls the offense dice again to see what the play itself did, and the team that was fouled takes whichever is better (accept or decline). A flag never goes more than half the distance to the goal. Pass interference is a spot foul, so it's worth more on deeper passes (Screen 8, Short 10, Sideline 12, Medium 20, Long and Hail Mary 35). A flag in the offense box plus a natural 5 on the defense dice (red 3, green 2) means flags on both teams: offsetting, replay the down.</li>
   <li><b>Kickoffs and punts take two rolls, one per team.</b> The kicking team rolls its Kickoff column (touchback or returnable) or its Punt column (how far; 10 = blocked). Then the receiving team rolls its Kick Return or Punt Return column: where they start, a fair catch, a big return, or a fumble (10). The kicking team can try an <b>onside kick</b> instead: 36–39 recovers.</li>
   <li><b>Field goals and extra points.</b> Only the kicking team rolls, like the board game. 10 is blocked.</li>
   <li><b>Blocked punts and field goals.</b> The team that blocked it rolls the Blocked Kick column: KEEP (10–13) means the kicking team fell on it (a punt on 1st–3rd down keeps the ball), a number is the return, 37–39 is a touchdown.</li>
   <li><b>Coffin-corner punt.</b> Pick it on the punt call: the punt goes ${COFFIN} yards shorter and out of bounds, so there is no return. Still a touchback if it reaches the end zone.</li>
   <li><b>QB Sneak and Hail Mary.</b> Extra calls with their own columns. The sneak gets 1+ yards about 3 times in 4; Short Yardage and Blitz stuff it more. The Hail Mary is mostly knocked down, with a rare long catch, flag or touchdown; the Long Pass (prevent) defense knocks almost all of it down.</li>
   <li><b>Sideline call.</b> On a run or pass, the offense can say "get out of bounds" (the clock stops on any gain, but a box without * loses up to 5 yards) or "stay in bounds" (the clock keeps running, but a * box loses up to 5 yards). A gain that reaches the end zone is never cut.</li>
   <li><b>Overtime.</b> NFL playoff rules: both teams get the ball at least once, then next score wins.</li></ol></div>
   <div class="panel"><h2>Where the numbers come from</h2><p class="small">Each column was built to match the team's real 2022 season: Chiefs 66.8% completions, 8.1 yards per pass, 1.8% interceptions, 3.8% sacked, 4.7 per carry. Eagles 65.3%, 8.1, 1.7%, 7.6% sacked, 4.6 per carry. Where each kind of box sits comes from 30 real 1983 Paydirt team charts: on every play and roll we counted how often those charts put an incomplete, QT, flag, interception, fumble or breakaway there, and put ours in the same spots. That is why passes have long black runs of incompletes in the 30s, Long Pass most of all, and why flags gather on 19, 29 and 39 and the rare 10s. The yard boxes then rise smoothly: the common 30s and 20s hold everyday gains, the rare 10s the extremes.</p></div>`;
}
function diceKey(){
  const row=(n,ck,map,note)=>`<tr><th><span class="die sm" style="${dstyle(ck)}"></span> ${n}</th>${map.map(v=>`<td>${v}</td>`).join("")}<td class="small muted">${note}</td></tr>`;
  return `<div class="tbl"><table class="dk"><thead><tr><th>Die</th>${[1,2,3,4,5,6].map(f=>`<th>${f}</th>`).join("")}<th></th></tr></thead><tbody>
   ${(()=>{const D=diceCfg(S); return row(dname(0),D.c[0],BLACK.map(v=>v*10),"offense: tens")+row(dname(1),D.c[1],WHITE,"offense: ones")+row(dname(2),D.c[2],BLUE,"offense: ones")+row(dname(D.d[0]),D.c[D.d[0]],RED,"defense: first die")+row(dname(D.d[1]),D.c[D.d[1]],GREEN,"defense: second die");})()}</tbody></table></div>`;
}
function rulesView(){
  const s=S;
  return `<div class="panel"><h2>How a play works</h2><ol class="small">
   <li><b>Call.</b> Both play callers pick secretly: offense picks one of 9 plays (or QB Sneak, Hail Mary, punt, field goal, spike, kneel), a tempo and a sideline call; defense picks formation A–F. Every button shows its odds.</li>
   <li><b>See the odds.</b> Once both calls are locked, everyone sees the full matchup: every roll's box, the odds of each result, and the chance of a first down. Kicks and follow-up rolls show their whole column too.</li>
   <li><b>Roll.</b> Offense rolls black + white + blue (10–39). Defense rolls red + green (1–5).</li>
   <li><b>Look up.</b> Offense box from the offense chart, defense box from the defense chart, then the "who wins" rules (Playbook → How to read). The app does this and shows both boxes.</li>
   <li><b>Follow-up roll</b> when the result is QT, B, an interception or a fumble.</li>
   <li><b>Rotate.</b> After each play, the next player on each team becomes the caller, and the roller moves down one too.</li></ol></div>
  <div class="panel"><h2>Using normal dice</h2><div class="small">Use five dice of different colors. Each face reads as the number in the table. This gives the exact odds of Paydirt's special dice.</div>${diceKey()}
   <p class="small">Example: black 4 (30), white 3 (2), blue 6 (4) → <b>36</b>. Red 5 (2) + green 1 (0) → <b>2</b>. No colored dice? Tap "Roll" and let the app do it.</p></div>
  <div class="panel"><h2>Clock management</h2><ul class="small">
   <li>${s.nq} quarter${s.nq>1?"s":""} of ${s.qmin} minutes. Halftime resets timeouts to 3 per team.</li>
   <li>Time runs in 10-second boxes, like Paydirt. Every snap or kick uses 1 box (10s).</li>
   <li>If the clock is still running, the huddle uses more: Normal 3 boxes (30s), Hurry-up 1 box (10s), Run the clock 4 boxes (40s). So a run that stays in bounds costs 40s with a normal huddle.</li>
   <li><b>Clock stops</b> after an incomplete pass, out of bounds (*), a flag, a turnover, a score, a punt, a field goal try, a timeout, or a spike.</li>
   <li><b>Two-minute warning</b> stops the clock at 2:00 in Q${s.nq>=2?s.nq/2:"-"} and Q${s.nq}.</li>
   <li>If the clock would hit 0:00 before the snap, the quarter ends with no play.</li>
   <li><b>Untimed down.</b> A quarter can't end on a defensive penalty: if time runs out on one, the offense gets one more play at 0:00.</li>
   <li><b>Sideline call</b> on the offense call card: get out of bounds to stop the clock, or stay in bounds to keep it running. Each can cost up to 5 yards.</li>
   <li>Any player can call their team's timeout while the clock is running, before the dice are rolled.</li></ul></div>
  <div class="panel"><h2>Kicks and scoring</h2><ul class="small">
   <li>Kickoffs, punts, field goals and extra points: roll the offense dice and read the Kicks & returns chart. That box is final.</li>
   <li>Field goal distance = yards to the goal line + 17. It's good if the box is at least that far.</li>
   <li>Extra point: red box (10–11) is no good. Two-point try is a normal play from the 2.</li>
   <li>Safety: 2 points and a free kick. Tied at the end: overtime with NFL playoff rules. Coin toss, then both teams get the ball at least once, even if the first team scores a touchdown. Still tied after that: next score wins. 3 timeouts each.</li></ul></div>
  <div class="panel"><h2>About the original</h2><p class="small">A homemade tribute to Paydirt (Sports Illustrated / Avalon Hill), where each real team got its own chart built from its stats. Same dice, same 9 plays, same A–F defenses and the same "who wins" rules. The charts here are built from the 2022 Chiefs and Eagles, the Super Bowl LVII teams (KC 38, PHI 35).</p></div>`;
}

// ---------- Admin ----------
function adminView(){
  const s=S;
  return `<div class="panel"><h2>Admin</h2><div class="small muted">You control the game from this phone. Keep it open: it hosts the game for everyone.</div>
   ${shareBox()}
   <div class="row">${s.paused?`<button class="btn primary" data-act="send" data-a='{"type":"pause","on":false}'>▶ Resume game</button>`:`<button class="btn" data-act="confirm" data-what="pause">⏸ Pause game</button>`}
   <button class="btn" data-act="confirm" data-what="undo" ${s.prev?"":"disabled"}>↶ Undo last play</button>
   <button class="btn danger" data-act="confirm" data-what="newgame">Restart game</button></div></div>
   ${settingsBox()}${diceBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>`;
}
function shareURL(){ const base=location.href.split("#")[0]; return net.via==="db"?base:`${base}#${S.code}`; }
function shareBox(){
  if(net.via==="db") return `<div class="share"><div><div class="tag">Share this page's link</div></div></div>`;
  const url=shareURL();
  return `<div class="share"><div><div class="qr" id="qr" role="button" tabindex="0" data-act="qrbig" aria-label="QR code to join. Tap to make it bigger"></div><div class="qrhint">Tap to enlarge</div></div><div style="min-width:0"><div class="tag">Game code</div><div class="code">${esc(S.code)}</div><div class="small url">${esc(url)}</div><div class="row"><button class="btn small" data-act="copy">Copy link</button><button class="btn small" data-act="tvopen">Open TV view</button><a class="btn small" href="card.html#${esc(S.code)}" target="_blank" rel="noopener">Quick card</a></div></div></div>`;
}
function showBigQR(){
  if(!window.qrcode||!S) return; const ov=document.createElement("div"); ov.className="qrbig"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Big QR code");
  let svg=""; try{ const q=window.qrcode(0,"M"); q.addData(shareURL()); q.make(); svg=q.createSvgTag({cellSize:8,margin:2,scalable:true}); }catch(e){}
  ov.innerHTML=`<div class="big">${svg}</div><div class="c">${esc(S.code||"")}</div><div class="h">Scan to join · tap anywhere to close</div>`;
  const close=()=>{ ov.remove(); document.removeEventListener("keydown",esc1); }; const esc1=e=>{ if(e.key==="Escape") close(); };
  ov.addEventListener("click",close); document.addEventListener("keydown",esc1); document.body.appendChild(ov);
}
function drawQR(){
  const el=document.getElementById("qr"); if(!el||!window.qrcode) return;
  try{ const q=window.qrcode(0,"M"); q.addData(shareURL()); q.make(); el.innerHTML=q.createSvgTag({cellSize:4,margin:2,scalable:true}); }catch(e){}
}

// ---------- TV ----------
function tvView(){
  const s=S;
  return `<div class="tv">${scoreboard(true)}${field(true)}${resultBanner()}<div class="tvwait">${esc(waitingText())}</div>${s.phase==="lobby"&&net.via!=="db"&&mode!=="local"?`<div class="panel"><h2>Scan to join</h2>${shareBox()}</div>`:""}
   <div class="row" style="justify-content:space-between"><span class="tag">Join: ${esc(net.via==="db"?"open this page":shareURL())}</span><button class="btn ghost small" data-act="tab" data-t="field">Exit TV view</button></div></div>`;
}

// ---------- Home (not in a game yet) ----------
function homeView(){
  const code=(ui.code!=null?ui.code:(location.hash||"").replace("#","")).toUpperCase().slice(0,4);
  const canResume=(()=>{ const h=loadHost(); return h&&h.v===4&&h.admin===myId&&h.phase!=="over"?h:null; })();
  return `<div class="hero"><div class="tag">Super Bowl LVII rematch · Feb 12, 2023</div>
    <div class="herobox"><div class="hl kc"><span>Chiefs</span><b>38</b></div><div class="hl phi"><span>Eagles</span><b>35</b></div></div>
    <div class="muted">Paydirt-style dice football. Everyone plays on their own phone.</div></div>
   <div class="panel"><h2>Join a game</h2><label class="small muted" for="code">Game code</label>
    <input id="code" class="inp code-inp" maxlength="4" value="${esc(code)}" placeholder="ABCD" autocomplete="off" autocapitalize="characters">
    <div class="stack"><button class="btn primary" data-act="joincode">Join as a player</button><button class="btn" data-act="joincode" data-tv="1">Join as TV / cast screen</button></div></div>
   <div class="panel"><h2>Run the game (admin)</h2><div class="small muted">Start a new game on your phone. Everyone else joins with the code.</div>
    <div class="stack">${canResume?`<button class="btn primary" data-act="resume">Resume game ${esc(canResume.code)} (KC ${canResume.score.KC}, PHI ${canResume.score.PHI})</button>`:""}<button class="btn ${canResume?"":"primary"}" data-act="host">Start a new game</button></div></div>
   <div class="panel"><h2>One phone only?</h2><div class="small muted">Play everything on this device and pass it around.</div><div class="stack"><button class="btn" data-act="local">Play on this device</button></div></div>
   <div class="stack"><a class="btn ghost" href="card.html">Quick card: QR code, dice and rules</a></div>
   ${!window.Peer?`<div class="note small">Live sync didn't load. Reload, or use "Play on this device".</div>`:""}`;
}

// ---------- App shell ----------
function tabs(){
  const t=ui.tab||"field"; const items=ui.spectator&&!me()?[["field","Field","🏈"],["rules","Rules","📖"]]:[["field","Field","🏈"],["book","Playbook","📋"],["team","Teams","👥"],["rules","Rules","📖"]]; if(isAdmin()) items.push(["admin","Admin","⚙"]);
  return `<nav class="tabbar">${items.map(([k,l,i])=>`<button class="${t===k?"on":""}" data-act="tab" data-t="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join("")}<button data-act="tab" data-t="tv"><span aria-hidden="true">📺</span>TV</button></nav>`;
}
function headerBar(){
  const m=me(); const st=mode==="local"?"One device":net.live?"Live":"Offline";
  return `<div class="topbar"><div class="row"><span class="brand">TURKEY BOWL <b>LVII</b></span>${m?`<span class="chip ${TEAMS[m.team].cls}">${esc(m.name)} · ${TEAMS[m.team].short}</span>`:ui.spectator?`<span class="chip">TV</span>`:""}</div><span class="sync ${net.live||mode==="local"?"on":"off"}" title="${esc(net.status)}">● ${st}${S&&S.code&&net.via==="peer"?" · "+esc(S.code):""}</span></div>${net.status&&!net.live&&mode!=="local"?`<div class="note small">${esc(net.status)}</div>`:""}${ui.err?`<div class="note small err">${esc(ui.err)}</div>`:""}${mode==="client"&&!net.live&&S&&net.lostAt&&Date.now()-net.lostAt>20000?`<div class="note small">Admin's phone gone for good? Any phone can pick the game up from its last play. <button class="btn small" data-act="confirm" data-what="takeover">Take over hosting</button></div>`:""}`;
}
function confirmModal(){
  const c=ui.confirm; if(!c) return "";
  const msgs={newgame:["Restart the game?","The score, clock and play log reset for everyone. Players stay on their teams."],pause:["Pause the game?","Nobody can call or roll until you resume."],undo:["Undo the last play?","The field, score and clock go back one play."],kick:["Remove this player?","They can join again with the code."],takeover:["Take over hosting?","This phone becomes the host, with a new game code, starting from the last play it saw. Everyone else rejoins with the new code and keeps their team."],timeout:["Call a timeout?",`Stops the clock. ${TEAMS[c.team]?TEAMS[c.team].name:""} will have ${S&&c.team?S.to[c.team]-1:0} left this half.`]};
  const [h,p]=msgs[c.what]||["Are you sure?",""];
  return `<div class="cover" role="dialog" aria-modal="true" aria-labelledby="cfh"><div class="inner modal"><h2 id="cfh">${h}</h2><p class="muted">${esc(p)}</p><div class="row"><button class="btn danger big" data-act="confirmyes">Yes, ${c.what==="timeout"?"call timeout":c.what==="newgame"?"restart":c.what==="takeover"?"take over":c.what}</button><button class="btn big" data-act="confirmno">No, go back</button></div></div></div>`;
}
function render(){ try{ render0(); }catch(e){ showCrash(e&&e.message); } }
function render0(){
  if(mode==="host"||mode==="local") keepAwake();
  // The TV / cast screen (and a computer that only hosts) never joins a team and never sees a playbook.
  if(S&&mode==="host"&&!me()&&!isAdmin()) ui.spectator=true;
  if(S&&ui.spectator&&!me()&&(ui.tab==="book"||ui.tab==="team"||ui.tab==="admin")) ui.tab="tv";
  if(S){ if(ui.lastPhase==="lobby"&&S.phase!=="lobby"&&ui.tab!=="tv") ui.tab=ui.spectator&&!me()?"tv":"field"; ui.lastPhase=S.phase; }
  const y=window.scrollY; const active=document.activeElement&&document.activeElement.id; const val=active&&document.getElementById(active)?document.getElementById(active).value:null;
  let html="";
  if(mode==="none"||!S){ html=homeView(); if(mode!=="none"&&!S) html=headerBar()+`<div class="panel"><div class="wait">${esc(net.status||"Connecting…")}</div><button class="btn ghost" data-act="leavegame">Back</button></div>`; }
  else if(ui.tab==="tv") html=tvView();
  else {
    const t=ui.tab||"field"; let body="";
    if(t==="field") body=`${scoreboard()}${field()}${resultBanner()}${S.phase!=="lobby"&&!me()&&!isAdmin()&&!ui.spectator?joinBox():""}${ui.spectator&&S.phase!=="lobby"?"":turnPanel()}${S.phase!=="lobby"?logPanel():""}`;
    if(t==="book") body=ui.spectator&&!me()?`<div class="panel"><div class="wait">The TV screen doesn't show playbooks.</div></div>`:playbookView();
    if(t==="team") body=S.phase==="lobby"?lobbyPanel():`${joinBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>`;
    if(t==="rules") body=rulesView();
    if(t==="admin"&&isAdmin()) body=adminView();
    html=`${headerBar()}${body}<div class="row" style="justify-content:center"><button class="btn ghost small" data-act="leavegame">Leave game</button></div>${tabs()}`;
  }
  app.innerHTML=html+confirmModal();
  document.body.classList.toggle("tvmode",ui.tab==="tv");
  if(active&&document.getElementById(active)&&val!=null){ const el=document.getElementById(active); el.value=val; el.focus(); }
  window.scrollTo(0,y); drawQR();
}
function logPanel(){
  return `<details class="panel" ${ui.logOpen?"open":""} id="logd"><summary>Play-by-play</summary><div class="log">${S.log.map(l=>`<div class="${l.t==="KC"?"k":l.t==="PHI"?"p":""}"><span class="tag">${l.q>S.nq?"OT":"Q"+l.q}</span> ${esc(l.x)}</div>`).join("")||'<div class="muted">No plays yet.</div>'}</div></details>`;
}
function localGet(k){ try{return localStorage.getItem(k);}catch(e){return null;} }
function localSet(k,v){ try{localStorage.setItem(k,v);}catch(e){} }

// ---------- Events ----------
app.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b||b.disabled) return;
  const A=b.dataset.act;
  if(A==="qrbig"){ showBigQR(); return; }
  if(A==="send"){ let a; try{a=JSON.parse(b.dataset.a);}catch(_){return;} if(a.type==="call"&&!a.play) return; if(a.type==="call"||a.type==="roll"){ ui.sel=null; ui.md={}; ui.onside=false; } if(a.type==="call"){ ui.tempo="normal"; ui.obd=""; ui.coffin=false; } act(a); return; }
  if(A==="pick"){ ui.sel={key:b.dataset.key,play:b.dataset.play}; render(); return; }
  if(A==="tempo"){ ui.tempo=b.dataset.k; render(); return; }
  if(A==="pbplay"){ ui.pbPlay=b.dataset.k; render(); return; }
  if(A==="pbone"){ ui.pbOne=b.dataset.k==="1"; render(); return; }
  if(A==="pbcat"){ ui.pbCat=b.dataset.k; render(); return; }
  if(A==="pbzoom"){ const z=Math.round(((ui.pbZoom||(innerWidth<500?0.85:1))+(+b.dataset.k)*0.15)*100)/100; ui.pbZoom=Math.max(0.55,Math.min(1.9,z)); render(); return; }
  if(A==="obd"){ ui.obd=b.dataset.k; render(); return; }
  if(A==="coffin"){ ui.coffin=b.dataset.k==="1"; render(); return; }
  if(A==="face"){ ui.md[b.dataset.k]=+b.dataset.v; render(); return; }
  if(A==="tab"){ ui.tab=b.dataset.t; window.scrollTo(0,0); render(); return; }
  if(A==="pb"){ ui.pbTeam=b.dataset.t; render(); return; }
  if(A==="pbdef"){ ui.pbDef=b.dataset.d; render(); return; }
  if(A==="pbsub"){ ui.pbSub=b.dataset.k; render(); return; }
  if(A==="pbclear"){ ui.pbHL=false; render(); return; }
  if(A==="lookup"){ const l=S&&S.last; if(l&&l.team&&!(l.pk&&PLAYS[l.pk])){ ui.pbSub="st"; ui.pbHL=true; ui.pbCat="st"; ui.pbOne=false; } else if(l&&l.team){ ui.pbTeam=l.team; ui.pbDef=l.dk||"A"; const mm=me(); ui.pbSub=(mm&&mm.team&&mm.team!==l.team)?"def":"off"; ui.pbHL=true; ui.pbOne=false; ui.pbCat=l.fol&&(l.fol.kind==="QT"||l.fol.kind==="B")?"qt":PBCAT.pass[1].includes(l.pk)?"pass":"run"; } ui.tab="book"; window.scrollTo(0,0); render(); setTimeout(()=>{ const h=document.querySelector(".pd td.hi"); if(h) h.scrollIntoView({block:"center",inline:"center"}); },50); return; }
  if(A==="join"){ const n=(document.getElementById("pname")||{}).value||""; if(!n.trim()){ ui.err="Type your name first."; render(); return; } localSet("tb.name",n.trim()); ui.name=null; ui.spectator=false; act({type:"join",name:n.trim(),team:b.dataset.team}); return; }
  if(A==="confirm"){ ui.confirm={what:b.dataset.what,team:b.dataset.team,pid:b.dataset.pid}; render(); return; }
  if(A==="confirmno"){ ui.confirm=null; render(); return; }
  if(A==="confirmyes"){ const c=ui.confirm; ui.confirm=null;
    if(c.what==="newgame") act({type:"newgame"}); else if(c.what==="pause") act({type:"pause",on:true}); else if(c.what==="undo") act({type:"undo"}); else if(c.what==="kick") act({type:"kick",pid:c.pid}); else if(c.what==="timeout") act({type:"timeout",team:c.team}); else if(c.what==="takeover") takeOver();
    render(); return; }
  if(A==="host"){ const code=genCode(); hostPeer(code,false); ui.tab="team"; return; }
  if(A==="resume"){ S=loadHost(); hostPeer(S.code,true); ui.tab="field"; return; }
  if(A==="local"){ mode="local"; net.via=null; S=(()=>{const h=loadHost(); return h&&h.v===4&&h.code==="LOCAL"?h:null;})()||freshState("LOCAL"); S.admin=myId; saveHost(); ui.tab="team"; render(); return; }
  if(A==="joincode"){ const c=((document.getElementById("code")||{}).value||"").trim().toUpperCase(); if(c.length!==4){ ui.err="Enter the 4-letter game code."; render(); return; } ui.spectator=!!b.dataset.tv; ui.tab=ui.spectator?"tv":"team"; const h=loadHost(); if(h&&h.code===c&&h.admin===myId){ S=h; hostPeer(c,true); return; } joinPeer(c); return; }
  if(A==="leavegame"){ try{ if(net.peer) net.peer.destroy(); }catch(_){} net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null}; mode="none"; S=null; location.hash=""; render(); return; }
  if(A==="copy"){ const u=shareURL(); if(navigator.clipboard) navigator.clipboard.writeText(u).then(()=>{b.textContent="Copied";},()=>{b.textContent="Select the link above";}); return; }
  if(A==="tvopen"){ ui.tab="tv"; render(); return; }
});
app.addEventListener("change",e=>{
  if(e.target.id==="onside"){ ui.onside=e.target.checked; render(); }
  if(e.target.id==="manualdice"){ ui.manual=e.target.checked; ui.md={}; render(); }
  if(e.target.dataset&&e.target.dataset.dice!=null||e.target.id==="dicedef"){ const D=diceCfg(S); const c=D.c.slice(); let d=D.d.slice();
    if(e.target.id==="dicedef") d=e.target.value.split("").map(Number); else c[+e.target.dataset.dice]=e.target.value;
    act({type:"dice",c,d}); return; }
  if(e.target.id==="nq"||e.target.id==="qmin"){ act({type:"settings",nq:+(document.getElementById("nq")||{}).value,qmin:+(document.getElementById("qmin")||{}).value}); }
});
app.addEventListener("input",e=>{ if(e.target.id==="pname") ui.name=e.target.value; if(e.target.id==="code") ui.code=e.target.value.toUpperCase(); });
app.addEventListener("toggle",e=>{ if(e.target.id==="logd") ui.logOpen=e.target.open; },true);

// ---------- Boot ----------
setTimeout(function boot(){
  if(hasClaude()){ initDb().then(()=>{ if(!net.db){ mode="none"; render(); } }); ui.tab="team"; }
  // Always-on host: open ?host=CODE&admin=NAME on a computer. It hosts game CODE and the player
  // who joins as NAME becomes the admin automatically.
  let qs=null; try{ qs=new URLSearchParams(location.search); }catch(e){}
  const hq=qs?(qs.get("host")||"").toUpperCase():"";
  if(!hasClaude() && /^[A-Z]{4}$/.test(hq)){
    const h=loadHost(); const same=!!(h&&h.code===hq&&h.v===4); if(same) S=h;
    hostPeer(hq,same); const an=(qs.get("admin")||"").trim().toLowerCase(); if(an&&S){ S.autoAdmin=an; saveHost(); }
    ui.tab=S&&S.phase!=="lobby"?"tv":"team"; render(); return;
  }
  const code=(location.hash||"").replace("#","").toUpperCase();
  if(!hasClaude() && /^[A-Z]{4}$/.test(code)){
    const h=loadHost();
    if(h&&h.code===code&&(h.admin===myId||h.host===myId)){ S=h; ui.tab="field"; hostPeer(code,true); return; }
    ui.code=code;
  }
  render();
},0);
window.__tb={handleAction,needs,resolvePending,freshState,get S(){return S;},whoFor,callerOf,rollerOf};
