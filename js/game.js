(function(){
"use strict";
// ---------- Teams & charts (Super Bowl LVII, Feb 12 2023: KC 38, PHI 35) ----------
const TEAMS = {
  KC:{key:"KC",name:"Chiefs",city:"Kansas City",short:"KC",color:"var(--kc)",cls:"kc",
      blurb:"Mahomes on a bad ankle, Kelce underneath, a 65-yard Toney punt return, and the late Butker field goal."},
  PHI:{key:"PHI",name:"Eagles",city:"Philadelphia",short:"PHI",color:"var(--phi)",cls:"phi",
      blurb:"Jalen Hurts ran for 70 yards and 3 TDs and threw for 304. Outgained KC 417 to 340 and owned the clock."}
};
// Offensive plays. lo/hi = yard range per tens tier (10s, 20s, 30s). inc = ones value below which a pass falls incomplete.
const PLAYS = {
  RI:{name:"Inside Run",cat:"run",desc:"Between the tackles",lo:[-3,1,4],hi:[3,7,14],inc:[-1,-1,-1],turn:[10]},
  RO:{name:"Outside Run",cat:"run",desc:"Sweep / toss to the edge",lo:[-4,0,5],hi:[2,9,25],inc:[-1,-1,-1],turn:[10]},
  DR:{name:"Draw",cat:"run",desc:"Fake pass, hand off late",lo:[-2,1,4],hi:[3,8,18],inc:[-1,-1,-1],turn:[10]},
  QB:{name:"QB Sneak",cat:"sneak",desc:"Short yardage push",lo:[0,1,2],hi:[2,3,6],inc:[-1,-1,-1],turn:[]},
  SC:{name:"Screen",cat:"pass",desc:"Dump-off behind the rush",lo:[-4,0,5],hi:[3,10,30],inc:[3,1,0],turn:[10]},
  SP:{name:"Short Pass",cat:"pass",desc:"Quick slant / out",lo:[0,4,6],hi:[6,10,16],inc:[5,3,1],turn:[10]},
  MP:{name:"Medium Pass",cat:"pass",desc:"Dig / seam, 10–20 yards",lo:[8,10,14],hi:[14,20,28],inc:[8,5,2],turn:[10,11]},
  LP:{name:"Long Bomb",cat:"pass",desc:"Go route, high risk",lo:[35,25,30],hi:[35,45,60],inc:[10,8,4],turn:[10,11,12]},
  PA:{name:"Play Action",cat:"pass",desc:"Fake run, throw deep-ish",lo:[5,8,15],hi:[12,20,40],inc:[7,4,2],turn:[10]},
  SL:{name:"Sideline Pass",cat:"pass",desc:"Catch and step out. Stops the clock",lo:[0,3,5],hi:[5,9,14],inc:[6,4,2],turn:[10]}
};
const OFF_ORDER=["RI","RO","DR","QB","SC","SP","SL","MP","LP","PA"];
const DEFS = {
  RS:{name:"Run Stuff",desc:"8 in the box"},
  BA:{name:"Base 4-3",desc:"Balanced"},
  NI:{name:"Nickel",desc:"Extra DB, short zones"},
  PR:{name:"Prevent",desc:"Deep safeties, give up short"},
  BL:{name:"Blitz",desc:"Send 6, risky"}
};
const DEF_ORDER=["RS","BA","NI","PR","BL"];
// Matchup grid from the offense's view: + helps offense, - helps defense. Each point = 2 yards.
const GRID = {
  RI:{RS:-2,BA:-1,NI:1,PR:2,BL:0},
  RO:{RS:-1,BA:0,NI:1,PR:2,BL:1},
  DR:{RS:-1,BA:0,NI:0,PR:2,BL:2},
  QB:{RS:-2,BA:-1,NI:0,PR:1,BL:-1},
  SC:{RS:1,BA:0,NI:-1,PR:1,BL:2},
  SP:{RS:1,BA:0,NI:-2,PR:0,BL:-1},
  MP:{RS:2,BA:0,NI:-1,PR:-2,BL:0},
  LP:{RS:2,BA:1,NI:0,PR:-2,BL:1},
  PA:{RS:2,BA:0,NI:0,PR:-2,BL:-1},
  SL:{RS:1,BA:0,NI:-2,PR:1,BL:-1}
};
// Team ratings per play (-1..+1): adds 2 yards per point and makes passes complete more often.
const RATE = {
  KC:{RI:0,RO:0,DR:1,QB:0,SC:1,SP:1,SL:1,MP:1,LP:0,PA:0},
  PHI:{RI:1,RO:1,DR:0,QB:1,SC:0,SP:0,SL:0,MP:0,LP:1,PA:1}
};
// Defense bonus (adds to defense roll) per formation.
const DEFRATE = {KC:{RS:1,BA:0,NI:0,PR:0,BL:0}, PHI:{RS:0,BA:0,NI:0,PR:0,BL:1}};

// ---------- Dice ----------
const d6=()=>1+Math.floor(Math.random()*6);
const tensOf=f=>Math.ceil(f/2);          // 1-2 -> 1 (10s), 3-4 -> 2 (20s), 5-6 -> 3 (30s)
const offValue=(t,a,b)=>tensOf(t)*10+(a-1)+(b-1); // 10..40, same odds as the classic black + two white dice
function defAdj(D){return D<=4?2:D<=6?1:D<=8?0:D<=10?-1:-2;}

// Raw chart cell for a team/play/roll, before the defense.
function cell(team,pk,R){
  const p=PLAYS[pk]; const t=Math.min(3,Math.floor(R/10));
  const ones=R-t*10; const r=RATE[team][pk]||0;
  if(pk!=="QB"){
    if(R===20) return {k:"pen",y:-10,txt:"Holding on the offense, 10 yards back"};
    if(R===30) return {k:"pen",y:15,txt:"Pass interference / face mask on the defense, 15 yards and a first down",fd:true};
  }
  if(p.turn.includes(R)) return {k:p.cat==="run"?"fum":"int"};
  if(R>=39) return {k:"yds",y:p.cat==="run"?35:p.cat==="sneak"?8:pk==="LP"?65:45,brk:true};
  const ti=t-1;
  if(p.cat==="pass" && ones < (p.inc[ti]-r)) return {k:"inc"};
  if(pk==="LP" && t===1 && ones<10) return {k:"inc"};
  const y=Math.round(p.lo[ti]+(p.hi[ti]-p.lo[ti])*ones/10)+2*r;
  return {k:"yds",y};
}

// Full resolution of a scrimmage play.
function resolveScrimmage(team,pk,dk,dice){
  const def=other(team);
  const R=offValue(dice.t,dice.a,dice.b);
  let D=dice.d1+dice.d2+(DEFRATE[def][dk]||0); if(D>12)D=12;
  const p=PLAYS[pk]; const M=GRID[pk][dk];
  const c=cell(team,pk,R);
  const out={R,D,M,base:c,kind:c.k,y:0,txt:"",fd:!!c.fd};
  if(c.k==="pen"){out.y=c.y;out.txt=c.txt;out.pen=true;return out;}
  if(c.k==="fum"||c.k==="int"){out.txt=c.k==="int"?"Intercepted!":"Fumble! Defense recovers.";return out;}
  if(c.k==="inc"){
    if(dk==="BL" && p.cat==="pass" && D>=10){out.kind="yds";out.y=-7;out.txt="Sacked on the blitz";out.sack=true;return out;}
    out.txt="Incomplete";return out;
  }
  // yards cell: apply defense
  if(D>=12){
    if(M<0){ out.kind=p.cat==="pass"?"int":"fum"; out.txt=p.cat==="pass"?"Defense read it. Intercepted!":"Big hit, fumble! Defense recovers."; out.scoop=true; return out; }
    out.y=p.cat==="pass"?-7:-3; out.txt=p.cat==="pass"?"Sacked":"Stuffed in the backfield"; out.sack=p.cat==="pass"; return out;
  }
  if(dk==="BL" && p.cat==="pass" && D>=10){out.y=-7;out.txt="Sacked on the blitz";out.sack=true;return out;}
  const mult=p.cat==="sneak"?1:2;
  let y=c.y + M*mult + defAdj(D);
  if(c.brk) y=Math.max(y,c.y);
  out.y=y;
  if(D===2 && y<5){out.y=5;out.txt="Defensive offside, 5 free yards";out.pen=true;return out;}
  out.txt=(p.cat==="pass"?"Complete, ":"")+fmtGain(y)+(c.brk?" Breakaway!":"");
  return out;
}
function fmtGain(y){return y>0?`gain of ${y}`:y===0?"no gain":`loss of ${-y}`;}

// ---------- Game state ----------
const other=t=>t==="KC"?"PHI":"KC";
const dir=t=>t==="KC"?1:-1;
const toGoal=(s)=>s.poss==="KC"?100-s.ball:s.ball;
function spotName(abs){ if(abs===50)return "50"; return abs<50?`KC ${abs}`:`PHI ${100-abs}`; }
function ownToAbs(team,own){return team==="KC"?own:100-own;}

function newGame(qmin,nq){
  return {v:3,rev:1,phase:"lobby",poss:null,ball:25,down:1,toGo:10,q:1,qmin:qmin||8,nq:nq||4,clock:(qmin||8)*60,running:false,to:{KC:3,PHI:3},paused:false,score:{KC:0,PHI:0},
          recv1:null,last:null,log:[],winner:null,ot:false,started:Date.now()};
}
function addLog(s,team,txt){s.log.unshift({t:team,x:txt,q:s.q});if(s.log.length>14)s.log.length=14;}

function startPossession(s,team,own){s.poss=team;s.ball=ownToAbs(team,own);s.down=1;s.toGo=Math.min(10,toGoal(s));}

function tick(s){ /* timing handled by runClock */ }
// ---------- Clock ----------
const TEMPO={normal:{name:"Normal huddle",secs:35},hurry:{name:"Hurry-up",secs:12},milk:{name:"Run the clock",secs:40}};
const PLAYSECS={RI:5,RO:6,DR:5,QB:3,SC:6,SP:5,SL:5,MP:6,LP:8,PA:7,PUNT:8,FG:4,KO:5,SPIKE:2,KNEEL:3};
const fmtClock=c=>{c=Math.max(0,Math.round(c));return Math.floor(c/60)+":"+String(c%60).padStart(2,"0");};
const twoMinQ=s=>!s.ot&&(s.q===s.nq||(s.nq>=2&&s.q===s.nq/2));
// seconds that run off before the snap if the clock is running
function preSnap(s,tempo){ return s.running?(TEMPO[tempo]||TEMPO.normal).secs:0; }
function runClock(s,pk,tempo,stopAfter){
  const c0=s.clock; let c=c0; let warned=false;
  if(s.running){ const c1=c-preSnap(s,tempo); if(twoMinQ(s)&&!s.warned&&c>120&&c1<=120){ c=120; warned=true; } else c=c1; }
  const cBeforePlay=c; c-= (PLAYSECS[pk]||5);
  if(twoMinQ(s)&&!s.warned&&!warned&&cBeforePlay>120&&c<=120){ warned=true; }
  s.clock=Math.max(0,c); s.running=!stopAfter;
  if(warned){ s.warned=true; s.running=false; addLog(s,null,"Two-minute warning. Clock stops."); }
  if(s.clock<=0) endQuarter(s);
}
function endQuarter(s){
  s.running=false; s.warned=false;
  if(s.ot){ addLog(s,null,"End of the overtime period. Still tied, another period."); s.clock=s.qmin*60; return; }
  if(s.nq>=2&&s.q===s.nq/2){ s.q++; s.clock=s.qmin*60; s.to={KC:3,PHI:3}; s.halfPending=true; addLog(s,null,"Halftime! Timeouts reset to 3."); return; }
  if(s.q>=s.nq){ s.endPending=true; addLog(s,null,"0:00. End of regulation."); return; }
  s.q++; s.clock=s.qmin*60; addLog(s,null,`End of quarter. Q${s.q} starts.`);
}
function afterPlay(s){
  if(s.phase==="pat"||s.phase==="over") return;
  if(s.endPending){ s.endPending=false;
    if(s.score.KC===s.score.PHI){ s.q=s.nq+1; s.ot=true; s.clock=s.qmin*60; s.to={KC:2,PHI:2}; s.phase="kickoff"; s.kicker=Math.random()<.5?"KC":"PHI"; s.poss=null; addLog(s,null,"Tied! Overtime: next score wins."); }
    else endGame(s);
    return; }
  if(s.halfPending){ s.halfPending=false; s.phase="kickoff"; s.kicker=s.recv1; s.poss=null; addLog(s,null,`Second half: ${TEAMS[s.recv1].name} kick off.`); }
}
function endGame(s){ s.phase="over"; s.winner=s.score.KC>s.score.PHI?"KC":s.score.PHI>s.score.KC?"PHI":"TIE"; addLog(s,null,`Final: KC ${s.score.KC}, PHI ${s.score.PHI}`); }

function scored(s,team,pts,what){
  s.score[team]+=pts; addLog(s,team,`${TEAMS[team].name} ${what} (+${pts})`);
  if(s.ot && (what!=="touchdown")){ endGame(s); return true; }
  return false;
}

// Apply a resolved scrimmage play to state
function applyScrimmage(s,pk,dk,dice){
  const team=s.poss; const res=resolveScrimmage(team,pk,dk,dice);
  const losAbs=s.ball; let txt=`${TEAMS[team].short} ${PLAYS[pk].name} vs ${DEFS[dk].name}: ${res.txt}`;
  s.last={team,pk,dk,dice,R:res.R,D:res.D,txt:"",cls:""};
  const def=other(team);
  s.last.stop = res.kind!=="yds" || !!res.pen;
  const onesV=res.R%10;
  if(res.kind==="yds" && !res.pen && res.y>0 && (pk==="SL" || ((pk==="RO"||pk==="SP"||pk==="SC") && onesV%2===1))){ s.last.stop=true; s.last.oob=true; }
  if(res.kind==="int"||res.kind==="fum"){
    // turnover
    let spot = losAbs + dir(team)*(res.kind==="int"?(pk==="LP"?25:pk==="MP"?12:6):Math.max(0,Math.min(3,toGoal(s)-1)));
    spot=Math.max(1,Math.min(99,spot));
    const ret = res.scoop?100:(res.kind==="int"?(dice.a+dice.b-2)*3:0);
    let newBall = spot - dir(team)*ret;
    s.last.cls="to";
    if((def==="KC"&&newBall>=100)||(def==="PHI"&&newBall<=0)){
      txt+=" Returned for a TOUCHDOWN!";
      s.last.txt=txt; s.last.cls="td"; s.last.team=def; addLog(s,def,txt); tick(s);
      s.poss=def; scored(s,def,6,"touchdown"); if(s.ot){endGame(s);return;} s.phase="pat"; s.ball=ownToAbs(def,98); return;
    }
    newBall=Math.max(1,Math.min(99,newBall));
    s.poss=def; s.ball=newBall; s.down=1; s.toGo=Math.min(10,toGoal(s));
    txt+=` ${TEAMS[def].name} ball at ${spotName(newBall)}.`;
    s.last.txt=txt; addLog(s,team,txt); tick(s); return;
  }
  // yards (incl. penalties, incomplete y=0)
  let y=res.kind==="inc"?0:res.y;
  const gTo=toGoal(s);
  if(res.pen && !res.fd && y>0 && y>=gTo) y=Math.floor(gTo/2); // half the distance
  if(res.pen && y<0 && -y>=(100-gTo)) y=-Math.floor((100-gTo)/2);
  s.ball += dir(team)*y;
  const nowToGoal=toGoal(s);
  if(nowToGoal<=0){ // touchdown
    s.ball=team==="KC"?100:0; s.last.cls="td"; txt+=" TOUCHDOWN!"; s.last.txt=txt; addLog(s,team,txt); tick(s);
    scored(s,team,6,"touchdown"); if(s.ot){endGame(s);return;} s.phase="pat"; s.ball=ownToAbs(team,98); return;
  }
  if(nowToGoal>=100){ // safety
    s.ball=ownToAbs(team,0); txt+=" SAFETY!"; s.last.txt=txt; s.last.cls="to"; addLog(s,team,txt); tick(s);
    if(scored(s,def,2,"safety"))return;
    s.phase="kickoff"; s.kicker=team; s.freeKick=true; return;
  }
  if(res.pen && y<0 && !res.fd){ s.toGo-=y; }
  else if(res.fd || y>=s.toGo){ s.down=1; s.toGo=Math.min(10,nowToGoal); txt+=" First down!"; }
  else { s.toGo-=y; s.down++; if(res.pen && y<0) s.down--; }
  if(res.pen && y<0) {/* repeat down */}
  if(s.down>4){ txt+=` Turnover on downs.`; s.poss=def; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.cls="to"; }
  if(s.last.oob && !s.last.cls) txt+=" Out of bounds, clock stops.";
  if(s.last.cls) s.last.stop=true;
  s.last.txt=txt; addLog(s,team,txt); tick(s);
}

function applyPunt(s,dice){
  const team=s.poss, def=other(team); const R=offValue(dice.t,dice.a,dice.b);
  const t=Math.min(3,Math.floor(R/10)), ones=R-t*10;
  let txt; s.last={team,pk:"PUNT",dice,R,txt:"",cls:""};
  if(R===10){ s.ball-=dir(team)*5; s.ball=Math.max(1,Math.min(99,s.ball)); txt=`${TEAMS[team].short} punt BLOCKED! ${TEAMS[def].name} ball at ${spotName(s.ball)}.`; s.poss=def; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.cls="to"; }
  else{
    let net=36+(ones-5)*2+(t-2)*3; if(R===40){net=10;}
    let land=s.ball+dir(team)*net; let tb=false;
    if((team==="KC"&&land>=100)||(team==="PHI"&&land<=0)){ tb=true; land=ownToAbs(def,20); }
    s.poss=def; s.ball=land; s.down=1; s.toGo=Math.min(10,toGoal(s));
    txt=`${TEAMS[team].short} punts${R===40?", huge return!":""} ${tb?"Touchback.":`Net ${net}.`} ${TEAMS[def].name} ball at ${spotName(land)}.`;
  }
  s.last.txt=txt; addLog(s,team,txt); tick(s);
}
function fgNeed(dist){return dist<=29?13:dist<=39?17:dist<=45?21:dist<=50?25:dist<=55?30:dist<=60?35:99;}
function applyFG(s,dice){
  const team=s.poss, def=other(team); const R=offValue(dice.t,dice.a,dice.b);
  const dist=toGoal(s)+17; const need=fgNeed(dist);
  s.last={team,pk:"FG",dice,R,txt:"",cls:""};
  if(R>=need){
    const txt=`${TEAMS[team].short} ${dist}-yard field goal is GOOD! (rolled ${R}, needed ${need}+)`;
    s.last.txt=txt; s.last.cls="td"; addLog(s,team,txt); tick(s);
    if(scored(s,team,3,"field goal"))return;
    s.phase="kickoff"; s.kicker=team; return;
  }
  const nb=s.ball-dir(team)*7;
  // defense takes over at spot of kick or their 20, whichever is better for them
  const defOwnAtKick = def==="KC"?nb:100-nb; const ownSpot=Math.max(20,defOwnAtKick);
  s.poss=def; s.ball=ownToAbs(def,ownSpot); s.down=1; s.toGo=10;
  const txt=`${TEAMS[team].short} ${dist}-yard field goal is NO GOOD (rolled ${R}, needed ${need}+). ${TEAMS[def].name} ball at ${spotName(s.ball)}.`;
  s.last.txt=txt; s.last.cls="to"; addLog(s,team,txt); tick(s);
}
function applyKickoff(s,dice){
  const kick=s.kicker, recv=other(kick); const R=offValue(dice.t,dice.a,dice.b);
  const t=Math.min(3,Math.floor(R/10)), ones=R-t*10; let own,txt; s.last={team:kick,pk:"KO",dice,R,txt:"",cls:""};
  if(s.freeKick){ own=Math.min(45,25+ones*2); s.freeKick=false; txt=`Free kick after the safety. ${TEAMS[recv].name} start at their ${own}.`; }
  else if(R===40){ txt=`KICKOFF RETURNED FOR A TOUCHDOWN by the ${TEAMS[recv].name}!`; s.poss=recv; s.last.cls="td"; s.last.txt=txt; addLog(s,recv,txt);
    scored(s,recv,6,"touchdown"); if(s.ot){endGame(s);return;} s.phase="pat"; s.ball=ownToAbs(recv,98); return; }
  else if(t===1){ own=12+ones; txt=`Short return. ${TEAMS[recv].name} start at their ${own}.`; }
  else if(t===2){ own=25; txt=`Touchback. ${TEAMS[recv].name} start at their 25.`; }
  else { own=20+ones*3; txt=`Good return! ${TEAMS[recv].name} start at their ${own}.`; }
  startPossession(s,recv,own); s.phase="play"; s.last.txt=txt; addLog(s,recv,txt);
}
function applyPAT(s,kind,dice,pk,dk){
  const team=s.poss; const R=offValue(dice.t,dice.a,dice.b);
  s.last={team,pk:kind,dice,R,txt:"",cls:""};
  if(kind==="XP"){
    if(R<=12){ s.last.txt=`${TEAMS[team].short} extra point is NO GOOD! (rolled ${R})`; s.last.cls="to"; }
    else { s.score[team]+=1; s.last.txt=`${TEAMS[team].short} extra point is good.`; }
  } else {
    const res=resolveScrimmage(team,pk,dk,dice);
    const ok=(res.kind==="yds"||res.kind==="pen")&&res.y>=2;
    if(ok){ s.score[team]+=2; s.last.txt=`${TEAMS[team].short} two-point try (${PLAYS[pk].name} vs ${DEFS[dk].name}): GOOD!`; s.last.cls="td"; }
    else { s.last.txt=`${TEAMS[team].short} two-point try (${PLAYS[pk].name} vs ${DEFS[dk].name}): no good.`; s.last.cls="to"; }
    s.last.D=res.D;
  }
  addLog(s,team,s.last.txt);
  s.phase="kickoff"; s.kicker=team;
}

// ---------- Players, turns, actions (host is the single source of truth) ----------
function teamList(s,team){ return s.players.filter(p=>p.team===team); }
function pickRot(s,team,key){ const L=teamList(s,team); if(!L.length) return null; return L[((s[key][team]||0)%L.length+L.length)%L.length]; }
function callerOf(s,team){ return pickRot(s,team,"ci"); }
function rollerOf(s,team){ const L=teamList(s,team); if(!L.length) return null; return L[(((s.ci[team]||0)+(L.length>1?1:0)+(s.ro[team]||0))%L.length+L.length)%L.length]; }
const ST=k=>k==="PUNT"||k==="FG"||k==="SPIKE"||k==="KNEEL";
const NOROLL=k=>k==="SPIKE"||k==="KNEEL";
// What is the game waiting on? [{team, kind:'call'|'roll'|'pat'|'toss'|'start', side:'off'|'def'}]
function needs(s){
  const P=s.pend||{}; const out=[];
  if(s.phase==="lobby") return [{kind:"start"}];
  if(s.phase==="toss") return [{kind:"toss"}];
  if(s.phase==="over") return [];
  if(s.phase==="kickoff"){ if(!P.od) out.push({team:s.kicker,kind:"roll",side:"off"}); return out; }
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
  const adminOnly=["kick","move","up","settings","start","toss","newgame","undo","skip","pause"];
  if(s.paused && !(isAdmin&&adminOnly.includes(a.type)) && a.type!=="join" && a.type!=="leave") return false;
  switch(a.type){
    case "join":{
      const name=String(a.name||"").trim().slice(0,18)||"Player"; const team=a.team==="PHI"?"PHI":a.team==="KC"?"KC":null; if(!team) return false;
      const ex=s.players.find(p=>p.id===pid);
      if(ex){ if(ex.team!==team){ s.players=s.players.filter(p=>p.id!==pid); s.players.push({id:pid,name,team}); } else ex.name=name; }
      else s.players.push({id:pid,name,team});
      return true; }
    case "leave": s.players=s.players.filter(p=>p.id!==pid); return true;
    case "kick": if(!isAdmin) return false; s.players=s.players.filter(p=>p.id!==a.pid); return true;
    case "move": if(!isAdmin) return false; { const p=s.players.find(x=>x.id===a.pid); if(!p) return false; s.players=s.players.filter(x=>x.id!==a.pid); p.team=other(p.team); s.players.push(p); return true; }
    case "up": if(!isAdmin) return false; { const i=s.players.findIndex(x=>x.id===a.pid); if(i<0) return false; const t=s.players[i].team; let j=i-1; while(j>=0&&s.players[j].team!==t) j--; if(j<0) return false; const tmp=s.players[j]; s.players[j]=s.players[i]; s.players[i]=tmp; return true; }
    case "settings": if(!isAdmin) return false; { const m=+a.qmin, n=+a.nq; if(QMINS.includes(m)){ s.qmin=m; if(s.phase==="lobby"||s.phase==="toss") s.clock=m*60; } if(NQS.includes(n)&&(s.phase==="lobby"||s.phase==="toss"||n>=s.q)) s.nq=n; return true; }
    case "pause": if(!isAdmin) return false; s.paused=!!a.on; addLog(s,null,s.paused?"Game paused by the admin.":"Game resumed."); return true;
    case "timeout":{ const t=a.team==="PHI"?"PHI":a.team==="KC"?"KC":null; if(!t) return false; const me=s.players.find(p=>p.id===pid); if(!(isAdmin||(me&&me.team===t))) return false;
      if(s.phase!=="play"||s.pend.od||s.pend.dd||!(s.to[t]>0)) return false; s.to[t]--; s.running=false; addLog(s,t,`Timeout ${TEAMS[t].name} (${s.to[t]} left). Clock stopped at ${fmtClock(s.clock)}.`); s.last={txt:`Timeout, ${TEAMS[t].name}. Clock stopped at ${fmtClock(s.clock)}.`,cls:"",team:t}; return true; }
    case "start": if(!isAdmin||s.phase!=="lobby") return false; s.phase="toss"; s.clock=s.qmin*60; return true;
    case "toss": if(!isAdmin||s.phase!=="toss") return false; { snapshotPrev(s); const recv=Math.random()<.5?"KC":"PHI"; s.recv1=recv; s.kicker=other(recv); s.phase="kickoff"; s.pend={}; addLog(s,recv,`${TEAMS[recv].name} win the toss and receive.`); s.last={txt:`${TEAMS[recv].name} win the toss and will receive. ${TEAMS[s.kicker].name} kick off.`,cls:""}; return true; }
    case "newgame": if(!isAdmin) return false; { const keep=s.players, adm=s.admin, code=s.code; const n=newGame(s.qmin,s.nq); Object.assign(s,n,{players:keep,admin:adm,code,rev:s.rev,started:Date.now(),ci:{KC:0,PHI:0},ro:{KC:0,PHI:0},pend:{}}); delete s.prev; return true; }
    case "undo": if(!isAdmin||!s.prev) return false; { const p=JSON.parse(s.prev); const keep=s.players; const rev=s.rev; Object.keys(s).forEach(k=>delete s[k]); Object.assign(s,p,{players:keep,rev}); s.last={txt:"Admin undid the last play.",cls:""}; return true; }
    case "skip": if(!isAdmin) return false; { const t=a.team==="PHI"?"PHI":"KC"; if(a.which==="roll") s.ro[t]=(s.ro[t]||0)+1; else s.ci[t]=(s.ci[t]||0)+1; return true; }
    case "pat":{ const n=needs(s).find(x=>x.kind==="pat"); if(!n||!canAct(s,pid,n)) return false; if(a.k!=="XP"&&a.k!=="2PT") return false; s.pend.pat=a.k; s.pend.patBy=n.team; if(a.k==="2PT") s.ball=ownToAbs(s.poss,98); return true; }
    case "call":{
      const ns=needs(s); const n=ns.find(x=>x.kind==="call"&&x.side===a.side); if(!n||!canAct(s,pid,n)) return false;
      if(a.side==="off"){ if(!(PLAYS[a.play]||(s.phase==="play"&&ST(a.play)))) return false; if(a.play==="FG"&&toGoal(s)+17>60) return false;
        s.pend.oc=a.play; s.pend.tempo=TEMPO[a.tempo]?a.tempo:"normal";
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
      if(a.side==="off"){ const d=a.dice&&validDice(a.dice,["t","a","b"])?{t:a.dice.t,a:a.dice.a,b:a.dice.b}:{t:d6(),a:d6(),b:d6()}; s.pend.od=d; }
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
const QMINS=[3,4,5,6,8,10,15]; const NQS=[1,2,4];
function resolvePending(s){
  const P=s.pend; snapshotPrev(s);
  const dice=Object.assign({d1:1,d2:1},P.od||{},P.dd||{});
  const used={call:[],roll:[]};
  const tempo=P.tempo||"normal";
  if(s.phase==="kickoff"){ s.running=false; applyKickoff(s,dice); const tb=/Touchback|TOUCHDOWN/.test(s.last.txt); runClock(s,"KO",tempo,tb); }
  else if(s.phase==="pat"){
    const off=s.poss;
    if(P.pat==="XP"){ applyPAT(s,"XP",dice); used.call.push(off); used.roll.push(off); }
    else { applyPAT(s,"2PT",dice,P.oc,P.dc); used.call.push(off,other(off)); used.roll.push(off,other(off)); s.last.dice=dice; s.last.D=dice.d1+dice.d2; }
  } else {
    const off=s.poss, def=other(off);
    if(P.oc==="PUNT"){ applyPunt(s,dice); used.call.push(off); runClock(s,"PUNT",tempo,true); }
    else if(P.oc==="FG"){ applyFG(s,dice); used.call.push(off); runClock(s,"FG",tempo,true); }
    else if(P.oc==="SPIKE"||P.oc==="KNEEL"){ applySpecial(s,P.oc); used.call.push(off); runClock(s,P.oc,tempo,P.oc==="SPIKE"); }
    else { applyScrimmage(s,P.oc,P.dc,dice); used.call.push(off,def); if(s.last.pk&&PLAYS[s.last.pk]) s.last.tempo=tempo; runClock(s,P.oc,tempo,!!s.last.stop||s.phase!=="play"); }
  }
  // advance rotations: callers and rollers of the teams that acted
  const kickT = s.last && s.last.pk==="KO" ? s.last.team : null;
  if(kickT){ s.ro[kickT]=(s.ro[kickT]||0)+1; }
  new Set(used.call.filter(Boolean)).forEach(t=>s.ci[t]=(s.ci[t]||0)+1);

  s.pend={};
  afterPlay(s);
  s.seq=(s.seq||0)+1;
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
let ui={view:null,sel:null,manual:false,md:{},confirm:null,tv:false,err:""};
const hasClaude=()=>!!(window.claude&&typeof window.claude.use==="function");
function saveHost(){ try{ localStorage.setItem(LKEY,JSON.stringify(S)); }catch(e){} }
function loadHost(){ try{ const j=localStorage.getItem(LKEY); return j?JSON.parse(j):null; }catch(e){ return null; } }
function freshState(code){ const s=newGame(5,4); s.code=code; s.admin=myId; s.players=[]; s.ci={KC:0,PHI:0}; s.ro={KC:0,PHI:0}; s.pend={}; s.seq=0; s.started=Date.now(); return s; }
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
function hostPeer(code,resume){
  if(!window.Peer){ net.status="Live sync library didn't load. Playing on this device only."; mode="local"; render(); return; }
  net.via="peer"; mode="host"; net.code=code;
  if(!resume||!S||S.code!==code){ S=freshState(code); }
  saveHost(); location.hash=code;
  net.status="Opening your game…"; render();
  const peer=new Peer(PFX+code,peerOpts()); net.peer=peer;
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
  if(!window.Peer){ ui.err="Live sync library didn't load on this phone. Try reloading."; render(); return; }
  net.via="peer"; mode="client"; net.code=code; location.hash=code;
  net.status="Connecting to game "+code+"…"; render();
  const peer=net.peer||new Peer(undefined,peerOpts()); net.peer=peer;
  const go=()=>{
    const conn=peer.connect(PFX+code,{reliable:true}); net.hostConn=conn;
    const t=setTimeout(()=>{ if(!conn.open){ net.status="Still trying to reach the admin's phone. Make sure it has the game open."; render(); } },8000);
    conn.on("open",()=>{ clearTimeout(t); net.status="Connected"; net.live=true; render(); });
    conn.on("data",m=>{ if(m&&m.type==="state"){ const before=S&&S.seq; S=m.s; if(before!==undefined&&before!==S.seq&&S.last) celebrate(S.last); render(); } if(m&&m.type==="nope"){ ui.err="It's not your turn for that."; render(); } });
    conn.on("close",()=>{ net.live=false; net.status="Lost the admin's phone. Reconnecting…"; render(); setTimeout(go,2500); });
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
// ---------- Confetti ----------
function celebrate(last){
  if(!last||last.cls!=="td") return;
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv=document.getElementById("confetti"); cv.hidden=false; const ctx=cv.getContext("2d");
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
  <div class="dd"><span class="chip"><b>${ddTxt}</b></span>${s.poss&&(s.phase==="play"||s.phase==="pat")?`<span class="chip">Ball on <b>${spotName(s.ball)}</b></span>`:""}<span class="chip ${s.running?"live":""}">${s.running?"Clock running":"Clock stopped"}</span></div>`;
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
function diceHTML(d,showDef){
  if(!d) return "";
  const t=`<div class="die t roll" title="Tens die">${tensOf(d.t)*10}</div>`;
  const o=`<div class="die o roll">${d.a-1}</div><div class="die o roll">${d.b-1}</div>`;
  const df=showDef&&d.d1?`<span class="tag" style="margin-left:4px">DEF</span><div class="die d roll">${d.d1}</div><div class="die d roll">${d.d2}</div>`:"";
  return `<div class="dice">${t}${o}${df}</div>`;
}
function resultBanner(){
  const l=S.last; if(!l) return `<div class="result"><div class="big">Super Bowl LVII, replayed with dice</div></div>`;
  const showDef = l.D!=null && l.dice && l.dice.d1;
  return `<div class="result ${l.cls||""}" aria-live="polite">${l.dice&&l.dice.t?diceHTML(l.dice,showDef):""}<div class="big">${esc(l.txt)}</div>${l.R?`<div class="tag">Off ${l.R}${showDef?` · Def ${l.D}`:""}</div>`:""}</div>`;
}
function nm(p){ return p?esc(p.name):"the admin"; }
// Text describing who the game is waiting on
function waitingText(){
  const ns=needs(S); if(S.paused) return "Game paused by the admin.";
  if(!ns.length) return "";
  return ns.map(n=>{ if(n.kind==="start") return "Waiting for the admin to start the game."; if(n.kind==="toss") return "Waiting for the admin to flip the coin.";
    const w=whoFor(S,n); const T=TEAMS[n.team].name;
    return n.kind==="call"?`${nm(w)} is calling the ${T} ${n.side==="off"?"play":"defense"}.`:n.kind==="pat"?`${nm(w)} picks the ${T} try after the TD.`:`${nm(w)} rolls the ${T} ${n.side==="off"?"offense":"defense"} dice.`; }).join(" ");
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
  else out+=`<div class="panel slim">${statusChips()}${timeoutRow()}</div>`;
  if(adminCover.length) out+=`<details class="panel"><summary>Admin: act for someone who's away</summary>${adminCover.map(n=>actionCard(n,true)).join("")}</details>`;
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
      sheet=`<div class="tag">Tempo (how much clock runs before the snap)</div><div class="seg">${Object.keys(TEMPO).map(k=>`<button class="${tempo===k?"on":""}" data-act="tempo" data-k="${k}">${TEMPO[k].name}<small>${s.running?`−${TEMPO[k].secs}s`:"clock stopped"}</small></button>`).join("")}</div>
      <div class="plays">${OFF_ORDER.map(k=>{const r=RATE[n.team][k];return `<button class="play ${sel===k?"sel":""}" data-act="pick" data-key="${key}" data-play="${k}"><b>${PLAYS[k].name}</b><span class="s">${PLAYS[k].desc}</span>${r>0?'<span class="stars">★ team strength</span>':""}</button>`;}).join("")}
      ${s.phase==="play"?`<button class="play ${sel==="PUNT"?"sel":""}" data-act="pick" data-key="${key}" data-play="PUNT"><b>Punt</b><span class="s">${s.down===4?"Smart on 4th down":"Any down"}</span></button>
      <button class="play ${sel==="FG"?"sel":""}" data-act="pick" data-key="${key}" data-play="FG" ${dist<=60?"":"disabled"}><b>Field Goal</b><span class="s">${dist<=60?`${dist} yds · need ${fgNeed(dist)}+`:"Too far"}</span></button>
      <button class="play ${sel==="SPIKE"?"sel":""}" data-act="pick" data-key="${key}" data-play="SPIKE"><b>Spike</b><span class="s">Stop the clock, lose a down</span></button>
      <button class="play ${sel==="KNEEL"?"sel":""}" data-act="pick" data-key="${key}" data-play="KNEEL"><b>Kneel</b><span class="s">Lose 1, keep clock running</span></button>`:""}</div>`;
    } else {
      sheet=`<div class="plays">${DEF_ORDER.map(k=>{const r=DEFRATE[n.team][k];return `<button class="play def ${sel===k?"sel":""}" data-act="pick" data-key="${key}" data-play="${k}"><b>${DEFS[k].name}</b><span class="s">${DEFS[k].desc}</span>${r>0?'<span class="stars">★ team strength</span>':""}</button>`;}).join("")}</div>`;
    }
    const a=JSON.stringify({type:"call",side:n.side,play:sel,tempo:ui.tempo||"normal"});
    return `<div class="panel ${T.cls} turn">${tag}<h2>Your call: ${T.name} ${n.side==="off"?"offense":"defense"}</h2><div class="small muted">${n.side==="off"?`${ord(s.down)} & ${toGoal(s)<=s.toGo?"Goal":s.toGo} at ${spotName(s.ball)}. Keep your phone hidden from the other team.`:`Guess what ${TEAMS[s.poss].name} will run.`}</div>${sheet}
      <button class="btn primary big" data-act="send" data-a='${esc(a)}' ${sel?"":"disabled"}>Lock in ${sel?esc(playName(sel)):"call"}</button></div>`;
  }
  if(n.kind==="roll"){
    const off=n.side==="off"; const md=ui.md; const keys=off?["t","a","b"]:["d1","d2"];
    const ready=keys.every(k=>md[k]);
    const face=(k,label)=>`<label>${label}<span class="faces">${[1,2,3,4,5,6].map(v=>`<button data-act="face" data-k="${k}" data-v="${v}" class="${md[k]===v?"on":""}" aria-label="${label} ${v}">${v}</button>`).join("")}</span></label>`;
    const what=s.phase==="kickoff"?"kickoff":S.pend.oc==="PUNT"?"punt":S.pend.oc==="FG"?"field goal":S.pend.pat==="XP"?"extra point":off?"offense":"defense";
    const manual=ui.manual?`<div class="manual">${off?face("t","Tens die (1–2 = 10, 3–4 = 20, 5–6 = 30)")+face("a","Ones die A (face − 1)")+face("b","Ones die B (face − 1)"):face("d1","Defense die 1")+face("d2","Defense die 2")}</div>
      <button class="btn primary big" data-act="send" data-a='${esc(JSON.stringify({type:"roll",side:n.side,dice:Object.fromEntries(keys.map(k=>[k,md[k]||0]))}))}' ${ready?"":"disabled"}>Submit my dice</button>`:
      `<button class="btn primary big" data-act="send" data-a='${esc(JSON.stringify({type:"roll",side:n.side}))}'>🎲 Roll ${off?"3":"2"} dice</button>`;
    return `<div class="panel ${T.cls} turn">${tag}<h2>Your roll: ${T.name} ${what}</h2><label class="row small muted"><input type="checkbox" id="manualdice" ${ui.manual?"checked":""}> I'm rolling real dice</label>${manual}</div>`;
  }
  return "";
}

// ---------- Lobby / team ----------
function rosterCol(team){
  const L=teamList(S,team); const s=S;
  const c=callerOf(s,team), r=rollerOf(s,team);
  return `<div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} <span class="muted small">${L.length} player${L.length===1?"":"s"}</span></h2>
   <ol class="roster">${L.map((p,i)=>`<li><span>${esc(p.name)}${p.id===myId?' <span class="tag">you</span>':""}${p.id===s.admin?' <span class="tag">admin</span>':""}</span><span class="roles">${s.phase!=="lobby"&&c&&c.id===p.id?'<span class="pill">calls next</span>':""}${s.phase!=="lobby"&&r&&r.id===p.id?'<span class="pill r">rolls next</span>':""}</span>${isAdmin()?`<span class="adm"><button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"up",pid:p.id}))}' title="Move up" aria-label="Move ${esc(p.name)} up">↑</button><button class="mini" data-act="send" data-a='${esc(JSON.stringify({type:"move",pid:p.id}))}' title="Switch team" aria-label="Switch ${esc(p.name)} to other team">⇄</button><button class="mini" data-act="confirm" data-what="kick" data-pid="${esc(p.id)}" title="Remove" aria-label="Remove ${esc(p.name)}">✕</button></span>`:""}</li>`).join("")||'<li class="muted">No one yet</li>'}</ol>
   ${s.phase!=="lobby"&&isAdmin()&&L.length>1?`<div class="row"><button class="btn small" data-act="send" data-a='${esc(JSON.stringify({type:"skip",team,which:"call"}))}'>Skip caller</button><button class="btn small" data-act="send" data-a='${esc(JSON.stringify({type:"skip",team,which:"roll"}))}'>Skip roller</button></div>`:""}</div>`;
}
function joinBox(){
  const m=me(); const name=ui.name!=null?ui.name:(m?m.name:(localGet("tb.name")||""));
  return `<div class="panel"><h2>${m?"Your team":"Join a team"}</h2>
    <label class="small muted" for="pname">Your name</label><input id="pname" class="inp" maxlength="18" value="${esc(name)}" placeholder="e.g. Grandpa Joe" autocomplete="off">
    <div class="row"><button class="btn team-kc ${m&&m.team==="KC"?"on":""}" data-act="join" data-team="KC">Join Chiefs</button><button class="btn team-phi ${m&&m.team==="PHI"?"on":""}" data-act="join" data-team="PHI">Join Eagles</button>${m?`<button class="btn ghost small" data-act="send" data-a='{"type":"leave"}'>Leave team</button>`:""}</div>
    <div class="small muted">Turns rotate in the order players joined. The admin can reorder.</div></div>`;
}
function lobbyPanel(){
  return `${joinBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>${isAdmin()?settingsBox()+`<button class="btn primary big" data-act="send" data-a='{"type":"start"}'>Start the game</button>`:`<div class="wait">Waiting for the admin to start.</div>`}`;
}
function settingsBox(){
  const s=S; const locked=!(s.phase==="lobby"||s.phase==="toss");
  return `<div class="panel"><h2>Game length</h2><div class="row"><label class="small muted" for="nq">Quarters</label><select id="nq" class="btn">${NQS.map(n=>`<option value="${n}" ${s.nq===n?"selected":""}>${n}</option>`).join("")}</select>
   <label class="small muted" for="qmin">Minutes per quarter</label><select id="qmin" class="btn" ${locked?"disabled":""}>${QMINS.map(n=>`<option value="${n}" ${s.qmin===n?"selected":""}>${n} min</option>`).join("")}</select></div>
   <div class="small muted">About ${Math.round(s.nq*s.qmin*3.5)} snaps and kicks, roughly ${Math.round(s.nq*s.qmin*3.5*0.6/5)*5} minutes at the table.</div></div>`;
}

// ---------- Playbook / rules ----------
function chartTable(team){
  const cols=[[10,12],[13,16],[17,19],[20,23],[24,26],[27,29],[30,33],[34,36],[37,40]];
  const lab=c=>`${c[0]}–${c[1]}`;
  const sum=(pk,c)=>{ const vals=[]; for(let R=c[0];R<=c[1];R++){ const x=cell(team,pk,R); vals.push(x.k==="yds"?(x.brk?"BIG":x.y):x.k==="inc"?"inc":x.k==="pen"?(x.y>0?"+15P":"−10P"):x.k.toUpperCase()); }
    const nums=vals.filter(v=>typeof v==="number"); const others=[...new Set(vals.filter(v=>typeof v!=="number"))];
    let t=nums.length?(Math.min(...nums)===Math.max(...nums)?`${Math.min(...nums)}`:`${Math.min(...nums)} to ${Math.max(...nums)}`):"";
    if(others.length) t+=(t?", ":"")+others.join(", ");
    const cls=others.includes("INT")||others.includes("FUM")?"cell-to":others.includes("BIG")?"cell-td":nums.length===0?"cell-inc":"";
    return `<td class="${cls}">${t}</td>`; };
  return `<div class="tbl"><table><thead><tr><th>Play</th>${cols.map(c=>`<th>${lab(c)}</th>`).join("")}</tr></thead><tbody>${OFF_ORDER.map(pk=>`<tr><td><b>${PLAYS[pk].name}</b>${RATE[team][pk]>0?" ★":""}</td>${cols.map(c=>sum(pk,c)).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function matchupTable(){
  return `<div class="tbl"><table><thead><tr><th>Play \\ Defense</th>${DEF_ORDER.map(d=>`<th>${DEFS[d].name}</th>`).join("")}</tr></thead><tbody>${OFF_ORDER.map(p=>`<tr><td><b>${PLAYS[p].name}</b></td>${DEF_ORDER.map(d=>{const m=GRID[p][d];return `<td class="${m>0?"good":m<0?"bad":""}">${m>0?"+":""}${m*(p==="QB"?1:2)}</td>`;}).join("")}</tr>`).join("")}</tbody></table></div><p class="small muted">Yards added (+) or taken away (−) when that defense meets that play. Blitz vs any pass: defense roll of 10+ is a sack.</p>`;
}
function playbookView(){
  const m=me(); const team=ui.pbTeam||(m?m.team:"KC");
  return `<div class="seg wide">${["KC","PHI"].map(t=>`<button class="${team===t?"on":""}" data-act="pb" data-t="${t}">${TEAMS[t].name}</button>`).join("")}</div>
   <div class="panel ${TEAMS[team].cls}"><h2>${TEAMS[team].name} offense chart</h2><div class="small muted">${esc(TEAMS[team].blurb)}</div>${chartTable(team)}<div class="small muted">Find your offense roll (10–40) across the top. Numbers are yards before the defense adjusts. inc = incomplete, P = penalty, BIG = breakaway, INT/FUM = turnover. ★ = team strength.</div></div>
   <div class="panel"><h2>Offense vs defense</h2>${matchupTable()}</div>
   <div class="panel"><h2>Defense roll (2 dice)</h2><div class="tbl"><table><thead><tr><th>Defense total</th><th>Effect</th></tr></thead><tbody>
    <tr><td>2</td><td>Offside: offense gets at least 5 yards</td></tr><tr><td>3–4</td><td>+2 yards for offense</td></tr><tr><td>5–6</td><td>+1</td></tr><tr><td>7–8</td><td>No change</td></tr><tr><td>9–10</td><td>−1</td></tr><tr><td>11</td><td>−2</td></tr><tr><td>12</td><td>Big defensive play. If the defense guessed right: turnover. Otherwise: sack (−7) or stuff (−3)</td></tr></tbody></table></div>
    <div class="small muted">Chiefs ★ Run Stuff and Eagles ★ Blitz add 1 to the defense roll.</div></div>`;
}
function rulesView(){
  const s=S;
  return `<div class="panel"><h2>How a play works</h2><ol class="small">
   <li><b>Call.</b> The offense's play caller picks a play and a tempo. The defense's play caller picks a formation. Neither sees the other's call.</li>
   <li><b>Roll.</b> The offense's dice roller rolls 3 dice: one tens die and two ones dice, making 10–40. The defense's roller rolls 2 dice (2–12).</li>
   <li><b>Result.</b> The offense roll is looked up on the team chart. The matchup and defense roll adjust it. The app moves the ball, the chains and the clock.</li>
   <li><b>Rotate.</b> After each play, the next player on each team becomes the caller, and the roller moves down one too.</li></ol></div>
  <div class="panel"><h2>Using normal 1–6 dice</h2>
   <div class="tbl"><table><thead><tr><th>Die shows</th><th>As the tens die</th><th>As a ones die</th><th>Chance</th></tr></thead><tbody>
   ${[1,2,3,4,5,6].map(f=>`<tr><td>${f}</td><td>${tensOf(f)*10}</td><td>${f-1}</td><td>1 in 6</td></tr>`).join("")}</tbody></table></div>
   <p class="small">Pick one die color as the tens die. Example: tens die 4, ones dice 6 and 2 → 20 + 5 + 1 = <b>26</b>. Each tens value (10, 20, 30) comes up 1 time in 3, and the two ones dice add to 0–10 with 5 most common, so you get the same odds as the classic game's special dice.</p></div>
  <div class="panel"><h2>Clock management</h2><ul class="small">
   <li>${s.nq} quarter${s.nq>1?"s":""} of ${s.qmin} minutes. Halftime resets timeouts to 3 per team.</li>
   <li>If the clock is running, time runs off before the snap: Normal huddle −35s, Hurry-up −12s, Run the clock −40s.</li>
   <li>Each play also takes 2–8 seconds (runs 5–6s, long passes 8s, punts 8s).</li>
   <li><b>Clock stops</b> after an incomplete pass, out of bounds, a penalty, a turnover, a score, a punt, a field goal try, a timeout, or a spike.</li>
   <li>Out of bounds: every Sideline Pass that gains yards, and Outside Run, Short Pass or Screen gains when the offense roll ends in an odd number.</li>
   <li><b>Two-minute warning</b> stops the clock at 2:00 in Q${s.nq>=2?s.nq/2:"-"} and Q${s.nq}.</li>
   <li>If the clock would hit 0:00 before the snap, the quarter ends with no play. Run the clock or kneel to finish a game you lead.</li>
   <li>Any player can call their team's timeout while the clock is running, before the dice are rolled.</li></ul></div>
  <div class="panel"><h2>Kicks and scoring</h2><ul class="small">
   <li>Kickoff (3 dice): 10s short return (own 12–22), 20s touchback at the 25, 30s good return (own 20–50), 40 returned for a TD.</li>
   <li>Punt: about 36 yards net, ± by the roll. 10 is blocked. 40 is a long return. Into the end zone is a touchback at the 20.</li>
   <li>Field goal distance = yards to the goal line + 17. Need: up to 29 yds 13+, 30–39 17+, 40–45 21+, 46–50 25+, 51–55 30+, 56–60 35+.</li>
   <li>Extra point misses only on 10–12. Two-point try is a normal play from the 2; gain 2+ to score.</li>
   <li>Safety: 2 points and a free kick. Tied at the end: overtime, next score wins.</li>
   <li>Offense roll 20 = holding (−10, replay down). 30 = pass interference on the defense (+15, first down).</li></ul></div>
  <div class="panel"><h2>About the original</h2><p class="small">This is a homemade tribute to the classic 1970s–90s sports dice games, where each real team got its own chart built from its stats. The charts here are inspired by Super Bowl LVII (Feb 12, 2023): Kansas City 38, Philadelphia 35. The Eagles' strengths are the run game and the QB push. The Chiefs' are short and quick passes.</p></div>`;
}

// ---------- Admin ----------
function adminView(){
  const s=S;
  return `<div class="panel"><h2>Admin</h2><div class="small muted">You control the game from this phone. Keep it open: it hosts the game for everyone.</div>
   ${shareBox()}
   <div class="row">${s.paused?`<button class="btn primary" data-act="send" data-a='{"type":"pause","on":false}'>▶ Resume game</button>`:`<button class="btn" data-act="confirm" data-what="pause">⏸ Pause game</button>`}
   <button class="btn" data-act="confirm" data-what="undo" ${s.prev?"":"disabled"}>↶ Undo last play</button>
   <button class="btn danger" data-act="confirm" data-what="newgame">Restart game</button></div></div>
   ${settingsBox()}<div class="grid2">${rosterCol("KC")}${rosterCol("PHI")}</div>`;
}
function shareURL(){ const base=location.href.split("#")[0]; return net.via==="db"?base:`${base}#${S.code}`; }
function shareBox(){
  if(net.via==="db") return `<div class="share"><div><div class="tag">Share this page's link</div></div></div>`;
  const url=shareURL();
  return `<div class="share"><div class="qr" id="qr" aria-label="QR code to join"></div><div style="min-width:0"><div class="tag">Game code</div><div class="code">${esc(S.code)}</div><div class="small url">${esc(url)}</div><div class="row"><button class="btn small" data-act="copy">Copy link</button><button class="btn small" data-act="tvopen">Open TV view</button></div></div></div>`;
}
function drawQR(){
  const el=document.getElementById("qr"); if(!el||!window.qrcode) return;
  try{ const q=window.qrcode(0,"M"); q.addData(shareURL()); q.make(); el.innerHTML=q.createSvgTag({cellSize:4,margin:2,scalable:true}); }catch(e){}
}

// ---------- TV ----------
function tvView(){
  const s=S;
  return `<div class="tv">${scoreboard(true)}${field(true)}${resultBanner()}<div class="tvwait">${esc(waitingText())}</div>
   <div class="row" style="justify-content:space-between"><span class="tag">Join: ${esc(net.via==="db"?"open this page":shareURL())}</span><button class="btn ghost small" data-act="tab" data-t="field">Exit TV view</button></div></div>`;
}

// ---------- Home (not in a game yet) ----------
function homeView(){
  const code=(ui.code!=null?ui.code:(location.hash||"").replace("#","")).toUpperCase().slice(0,4);
  const canResume=(()=>{ const h=loadHost(); return h&&h.v===3&&h.admin===myId&&h.phase!=="over"?h:null; })();
  return `<div class="hero"><span class="tag">Super Bowl LVII · Feb 12, 2023</span>
    <h1><span class="kc">Chiefs</span> 38<br><span class="phi">Eagles</span> 35</h1>
    <div class="muted">The Thanksgiving dice football rematch. Everyone plays on their own phone.</div></div>
   <div class="panel"><h2>Join a game</h2><label class="small muted" for="code">Game code</label>
    <input id="code" class="inp code-inp" maxlength="4" value="${esc(code)}" placeholder="ABCD" autocomplete="off" autocapitalize="characters">
    <div class="row"><button class="btn primary big" data-act="joincode">Join as a player</button><button class="btn" data-act="joincode" data-tv="1">Join as TV / cast screen</button></div></div>
   <div class="panel"><h2>Run the game (admin)</h2><div class="small muted">Start a new game on your phone. Everyone else joins with the code.</div>
    <div class="row"><button class="btn" data-act="host">Start a new game</button>${canResume?`<button class="btn primary" data-act="resume">Resume game ${esc(canResume.code)} (${canResume.score.KC}–${canResume.score.PHI})</button>`:""}</div></div>
   <div class="panel"><h2>One phone only?</h2><div class="small muted">Play everything on this device and pass it around.</div><button class="btn" data-act="local">Play on this device</button></div>
   ${!window.Peer?`<div class="note small">Live sync didn't load. Reload, or use "Play on this device".</div>`:""}`;
}

// ---------- App shell ----------
function tabs(){
  const t=ui.tab||"field"; const items=[["field","Field","🏈"],["book","Playbook","📋"],["team","Teams","👥"],["rules","Rules","📖"]]; if(isAdmin()) items.push(["admin","Admin","⚙"]);
  return `<nav class="tabbar">${items.map(([k,l,i])=>`<button class="${t===k?"on":""}" data-act="tab" data-t="${k}"><span aria-hidden="true">${i}</span>${l}</button>`).join("")}<button data-act="tab" data-t="tv"><span aria-hidden="true">📺</span>TV</button></nav>`;
}
function headerBar(){
  const m=me(); const st=mode==="local"?"One device":net.live?"Live":"Offline";
  return `<div class="topbar"><div class="row"><span class="brand">TURKEY BOWL <b>LVII</b></span>${m?`<span class="chip ${TEAMS[m.team].cls}">${esc(m.name)} · ${TEAMS[m.team].short}</span>`:ui.spectator?`<span class="chip">TV</span>`:""}</div><span class="sync ${net.live||mode==="local"?"on":"off"}" title="${esc(net.status)}">● ${st}${S&&S.code&&net.via==="peer"?" · "+esc(S.code):""}</span></div>${net.status&&!net.live&&mode!=="local"?`<div class="note small">${esc(net.status)}</div>`:""}${ui.err?`<div class="note small err">${esc(ui.err)}</div>`:""}`;
}
function confirmModal(){
  const c=ui.confirm; if(!c) return "";
  const msgs={newgame:["Restart the game?","The score, clock and play log reset for everyone. Players stay on their teams."],pause:["Pause the game?","Nobody can call or roll until you resume."],undo:["Undo the last play?","The field, score and clock go back one play."],kick:["Remove this player?","They can join again with the code."],timeout:["Call a timeout?",`Stops the clock. ${TEAMS[c.team]?TEAMS[c.team].name:""} will have ${S&&c.team?S.to[c.team]-1:0} left this half.`]};
  const [h,p]=msgs[c.what]||["Are you sure?",""];
  return `<div class="cover" role="dialog" aria-modal="true" aria-labelledby="cfh"><div class="inner modal"><h2 id="cfh">${h}</h2><p class="muted">${esc(p)}</p><div class="row"><button class="btn danger big" data-act="confirmyes">Yes, ${c.what==="timeout"?"call timeout":c.what==="newgame"?"restart":c.what}</button><button class="btn big" data-act="confirmno">No, go back</button></div></div></div>`;
}
function render(){
  if(S){ if(ui.lastPhase==="lobby"&&S.phase!=="lobby"&&ui.tab!=="tv") ui.tab="field"; ui.lastPhase=S.phase; }
  const y=window.scrollY; const active=document.activeElement&&document.activeElement.id; const val=active&&document.getElementById(active)?document.getElementById(active).value:null;
  let html="";
  if(mode==="none"||!S){ html=homeView(); if(mode!=="none"&&!S) html=headerBar()+`<div class="panel"><div class="wait">${esc(net.status||"Connecting…")}</div><button class="btn ghost" data-act="leavegame">Back</button></div>`; }
  else if(ui.tab==="tv") html=tvView();
  else {
    const t=ui.tab||"field"; let body="";
    if(t==="field") body=`${scoreboard()}${field()}${resultBanner()}${S.phase!=="lobby"&&!me()&&!isAdmin()&&!ui.spectator?joinBox():""}${ui.spectator&&S.phase!=="lobby"?"":turnPanel()}${S.phase!=="lobby"?logPanel():""}`;
    if(t==="book") body=playbookView();
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
  if(A==="send"){ let a; try{a=JSON.parse(b.dataset.a);}catch(_){return;} if(a.type==="call"&&!a.play) return; if(a.type==="call"||a.type==="roll"){ ui.sel=null; ui.md={}; } if(a.type==="call") ui.tempo="normal"; act(a); return; }
  if(A==="pick"){ ui.sel={key:b.dataset.key,play:b.dataset.play}; render(); return; }
  if(A==="tempo"){ ui.tempo=b.dataset.k; render(); return; }
  if(A==="face"){ ui.md[b.dataset.k]=+b.dataset.v; render(); return; }
  if(A==="tab"){ ui.tab=b.dataset.t; window.scrollTo(0,0); render(); return; }
  if(A==="pb"){ ui.pbTeam=b.dataset.t; render(); return; }
  if(A==="join"){ const n=(document.getElementById("pname")||{}).value||""; if(!n.trim()){ ui.err="Type your name first."; render(); return; } localSet("tb.name",n.trim()); ui.name=null; ui.spectator=false; act({type:"join",name:n.trim(),team:b.dataset.team}); return; }
  if(A==="confirm"){ ui.confirm={what:b.dataset.what,team:b.dataset.team,pid:b.dataset.pid}; render(); return; }
  if(A==="confirmno"){ ui.confirm=null; render(); return; }
  if(A==="confirmyes"){ const c=ui.confirm; ui.confirm=null;
    if(c.what==="newgame") act({type:"newgame"}); else if(c.what==="pause") act({type:"pause",on:true}); else if(c.what==="undo") act({type:"undo"}); else if(c.what==="kick") act({type:"kick",pid:c.pid}); else if(c.what==="timeout") act({type:"timeout",team:c.team});
    render(); return; }
  if(A==="host"){ const code=genCode(); hostPeer(code,false); ui.tab="team"; return; }
  if(A==="resume"){ S=loadHost(); hostPeer(S.code,true); ui.tab="field"; return; }
  if(A==="local"){ mode="local"; net.via=null; S=(()=>{const h=loadHost(); return h&&h.v===3&&h.code==="LOCAL"?h:null;})()||freshState("LOCAL"); S.admin=myId; saveHost(); ui.tab="team"; render(); return; }
  if(A==="joincode"){ const c=((document.getElementById("code")||{}).value||"").trim().toUpperCase(); if(c.length!==4){ ui.err="Enter the 4-letter game code."; render(); return; } ui.spectator=!!b.dataset.tv; ui.tab=ui.spectator?"tv":"team"; const h=loadHost(); if(h&&h.code===c&&h.admin===myId){ S=h; hostPeer(c,true); return; } joinPeer(c); return; }
  if(A==="leavegame"){ try{ if(net.peer) net.peer.destroy(); }catch(_){} net={status:"",peer:null,conns:[],hostConn:null,code:null,db:null,via:null}; mode="none"; S=null; location.hash=""; render(); return; }
  if(A==="copy"){ const u=shareURL(); if(navigator.clipboard) navigator.clipboard.writeText(u).then(()=>{b.textContent="Copied";},()=>{b.textContent="Select the link above";}); return; }
  if(A==="tvopen"){ ui.tab="tv"; render(); return; }
});
app.addEventListener("change",e=>{
  if(e.target.id==="manualdice"){ ui.manual=e.target.checked; ui.md={}; render(); }
  if(e.target.id==="nq"||e.target.id==="qmin"){ act({type:"settings",nq:+(document.getElementById("nq")||{}).value,qmin:+(document.getElementById("qmin")||{}).value}); }
});
app.addEventListener("input",e=>{ if(e.target.id==="pname") ui.name=e.target.value; if(e.target.id==="code") ui.code=e.target.value.toUpperCase(); });
app.addEventListener("toggle",e=>{ if(e.target.id==="logd") ui.logOpen=e.target.open; },true);

// ---------- Boot ----------
(function boot(){
  if(hasClaude()){ initDb().then(()=>{ if(!net.db){ mode="none"; render(); } }); ui.tab="team"; }
  const code=(location.hash||"").replace("#","").toUpperCase();
  if(!hasClaude() && /^[A-Z]{4}$/.test(code)){
    const h=loadHost();
    if(h&&h.code===code&&h.admin===myId){ S=h; ui.tab="field"; hostPeer(code,true); return; }
    ui.code=code;
  }
  render();
})();
window.__tb={handleAction,needs,resolvePending,freshState,get S(){return S;},whoFor,callerOf,rollerOf};
})();
