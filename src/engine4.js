// ---------- Teams (Super Bowl LVII, Feb 12 2023: KC 38, PHI 35) ----------
const TEAMS = {
  KC:{key:"KC",name:"Chiefs",city:"Kansas City",short:"KC",color:"var(--kc)",cls:"kc",
      blurb:"Mahomes on a bad ankle, Kelce underneath, a 65-yard Toney punt return, and the late Butker field goal."},
  PHI:{key:"PHI",name:"Eagles",city:"Philadelphia",short:"PHI",color:"var(--phi)",cls:"phi",
      blurb:"Jalen Hurts ran for 70 yards and 3 TDs and threw for 304. Outgained KC 417 to 340 and owned the clock."}
};

// ---------- Paydirt dice ----------
// Offense: BLACK die (tens) + two WHITE dice (ones). Defense: RED + GREEN.
// Faces below are what each die's 1-6 face reads as, so normal dice give the exact Paydirt odds.
const BLACK=[1,2,2,3,3,3], WHITE=[0,1,2,3,4,5], BLUE=[0,0,1,2,3,4], RED=[1,1,1,2,2,3], GREEN=[0,0,0,0,1,2];
const d6=()=>1+Math.floor(Math.random()*6);
const tensOf=f=>BLACK[f-1];
const offValue=(t,a,b)=>BLACK[t-1]*10+WHITE[a-1]+BLUE[b-1];   // 10..39
const defValue=(r,g)=>RED[r-1]+GREEN[g-1];                       // 1..5
const OFFP={}; for(let t=1;t<=6;t++)for(let a=1;a<=6;a++)for(let b=1;b<=6;b++){const R=offValue(t,a,b);OFFP[R]=(OFFP[R]||0)+1;}
const DEFP={}; for(let r=1;r<=6;r++)for(let g=1;g<=6;g++){const D=defValue(r,g);DEFP[D]=(DEFP[D]||0)+1;}
const ROLLS=[]; for(let R=10;R<=39;R++) ROLLS.push(R);

// ---------- Plays (Paydirt's nine) and defenses (A-F) ----------
const PLAYS = {
  LP:{n:1,name:"Line Plunge",cat:"run",desc:"Straight ahead, short yardage"},
  OT:{n:2,name:"Off Tackle",cat:"run",desc:"Power run off the tackle"},
  ER:{n:3,name:"End Run",cat:"run",desc:"Sweep to the edge"},
  DR:{n:4,name:"Draw",cat:"run",desc:"Fake pass, hand off late"},
  SC:{n:5,name:"Screen",cat:"pass",desc:"Dump-off behind the rush"},
  SP:{n:6,name:"Short Pass",cat:"pass",desc:"Quick slant / out"},
  MP:{n:7,name:"Medium Pass",cat:"pass",desc:"Dig / seam, 10–20 yards"},
  LG:{n:8,name:"Long Pass",cat:"pass",desc:"Go route, high risk"},
  SL:{n:9,name:"Sideline Pass",cat:"pass",desc:"Catch and step out"}
};
const OFF_ORDER=["LP","OT","ER","DR","SC","SP","MP","LG","SL"];
// Two extra calls from the Paydirt rules: the QB sneak and the Hail Mary. They have their own columns.
PLAYS.QS={n:"S",name:"QB Sneak",cat:"run",desc:"QB dives behind the center for a yard or two"};
PLAYS.HM={n:"H",name:"Hail Mary",cat:"pass",desc:"Everyone deep, one heave at the end zone"};
const XTRA=["QS","HM"]; const ALL_OFF=OFF_ORDER.concat(XTRA);
const DEFS = {
  A:{name:"A · Standard",short:"A",desc:"Balanced 4-3. No big holes, no wall"},
  B:{name:"B · Short Yardage",short:"B",desc:"Stack the box. Stops plunges and off tackle; weak deep"},
  C:{name:"C · Spread",short:"C",desc:"Spread out. Stops end runs and screens; soft inside"},
  D:{name:"D · Short Pass",short:"D",desc:"Underneath zones. Stops short and sideline passes"},
  E:{name:"E · Long Pass",short:"E",desc:"Prevent. Stops the long pass; gives up draws and runs"},
  F:{name:"F · Blitz",short:"F",desc:"Send the house. Sacks deep drops, stuffs inside runs; screens and draws beat it, and it can get burned deep"}
};
const DEF_ORDER=["A","B","C","D","E","F"];
// Matchup from the offense's view: + = defense guessed wrong, - = defense guessed right.
const GRID = {
  LP:{A:0,B:-2,C:1,D:1,E:2,F:-1},
  OT:{A:0,B:-2,C:1,D:1,E:2,F:-1},
  ER:{A:0,B:-1,C:-2,D:1,E:1,F:1},
  DR:{A:0,B:-1,C:1,D:1,E:2,F:2},
  SC:{A:0,B:1,C:-1,D:-1,E:1,F:2},
  SP:{A:0,B:1,C:0,D:-2,E:0,F:-1},
  MP:{A:0,B:1,C:0,D:-1,E:-1,F:0},
  LG:{A:0,B:2,C:0,D:1,E:-2,F:1},
  SL:{A:0,B:1,C:-1,D:-2,E:-1,F:-1}
};
// Team strengths (★): better odds on these plays.
const RATE = {
  KC:{LP:0,OT:0,ER:0,DR:1,SC:1,SP:1,MP:1,LG:0,SL:1},
  PHI:{LP:1,OT:0,ER:0,DR:0,SC:0,SP:1,MP:1,LG:1,SL:0}
};
const DEFRATE = {KC:{A:0,B:0,C:0,D:1,E:0,F:0}, PHI:{A:0,B:0,C:0,D:0,E:0,F:1}};

// ---------- Chart building ----------
// Turn bands [{p,k,lo,hi}] (worst to best) into one result per roll.
// Layout rule (keeps each band's real probability exactly):
//   30s (half of all rolls) hold the everyday middle results, rising from 30 to 39.
//   20s split: 20-24 sit just below the middle, 25-29 just above it.
//   10s (rarest) hold the extremes: 10-14 the worst results, 15-19 the best.
function bandsToRows(rolls,bands){
  const tot=rolls.reduce((a,R)=>a+OFFP[R],0); const sumP=bands.reduce((a,b)=>a+b.p,0);
  const grp=R=>{ const t=Math.floor(R/10), lo=(R%10)<5; return t===1?(lo?0:4):t===2?(lo?1:3):2; };
  const order=rolls.slice().sort((x,y)=>grp(x)-grp(y)||x-y);
  let acc=0; const mid={}; order.forEach(R=>{ mid[R]=(acc+OFFP[R]/2)/tot; acc+=OFFP[R]; });
  const out={};
  rolls.forEach(R=>{ const m=Math.max(0,Math.min(.9999,mid[R]));
    let c=0, bi=0; for(;bi<bands.length;bi++){ const w=bands[bi].p/sumP; if(m<c+w||bi===bands.length-1) break; c+=w; }
    const b=bands[bi]; const w=b.p/sumP; const pos=Math.max(0,Math.min(1,(m-c)/w));
    out[R]={k:b.k, y:b.lo!=null?Math.round(b.lo+(b.hi-b.lo)*pos):undefined};
  });
  return out;
}
// ---------- Where each kind of box goes (from real Paydirt charts) ----------
// AGG (pdata.js) counts, for every play and roll, how many of the 30 1983 team charts put an
// incomplete, QT, penalty, interception, fumble, breakaway or TD on that roll. We place each
// kind of box on the rolls where the real charts most often had it, so the black (incomplete)
// boxes come in the same long stretches, and penalties land on 19, 29 and 39 like the originals.
// How often each kind of box comes up (share of all 216 rolls), before team strength.
const TARGET={
  LP:{F:2.5,B:1.5,PEN:6}, OT:{F:2.5,B:1.5,PEN:6}, ER:{F:2.5,B:2.5,PEN:6}, DR:{F:2.5,B:1.5,PEN:6},
  SC:{INT:.9,F:1,QT:2.5,B:2,PEN:6,INC:23}, SP:{INT:1,QT:3.5,B:1.5,PEN:6,INC:27},
  MP:{INT:1.5,QT:4.5,B:1.5,PEN:6,INC:35}, LG:{TD:1.5,INT:2,QT:7,PEN:6,INC:45}, SL:{INT:1,QT:4,B:1,PEN:6,INC:33}
};
const AGGI={INC:1,QT:2,PEN:3,INT:4,F:5,B:6,TD:7};
const PLACE_ORDER=["TD","INT","F","QT","B","PEN","INC"];   // rarest first
// Yard results once the special boxes are placed, worst to best (share of the remaining rolls).
const BANDS = {
  LP:[{p:10,lo:-1,hi:0},{p:30,lo:1,hi:2},{p:35,lo:3,hi:4},{p:18,lo:5,hi:7},{p:7,lo:8,hi:12}],
  OT:[{p:14,lo:-3,hi:-1},{p:24,lo:0,hi:2},{p:36,lo:3,hi:5},{p:18,lo:6,hi:9},{p:8,lo:10,hi:18}],
  ER:[{p:20,lo:-4,hi:-1},{p:18,lo:0,hi:2},{p:30,lo:3,hi:6},{p:22,lo:7,hi:11},{p:10,lo:13,hi:20}],
  DR:[{p:16,lo:-2,hi:0},{p:26,lo:1,hi:3},{p:34,lo:4,hi:6},{p:17,lo:7,hi:11},{p:7,lo:12,hi:20}],
  SC:[{p:18,lo:-3,hi:0},{p:31,lo:1,hi:4},{p:38,lo:5,hi:9},{p:13,lo:10,hi:20}],
  SP:[{p:37,lo:2,hi:5},{p:36,lo:6,hi:8},{p:27,lo:9,hi:14}],
  MP:[{p:35,lo:8,hi:12},{p:40,lo:13,hi:17},{p:25,lo:18,hi:26}],
  LG:[{p:36,lo:20,hi:28},{p:38,lo:29,hi:40},{p:26,lo:41,hi:60}],
  SL:[{p:35,lo:3,hi:6},{p:42,lo:7,hi:10},{p:23,lo:11,hi:17}]
};
function aggOf(pk,R){ return (typeof AGG!=="undefined"&&AGG[pk]&&AGG[pk][R])||[1,0,0,0,0,0,0,0,0,0]; }
function placeBoxes(pk,team){
  const r=RATE[team][pk]||0; const t={...TARGET[pk]};
  if(t.INC) t.INC=Math.max(5,t.INC-4*r);
  if(t.QT) t.QT*=team==="KC"?.7:1.2;
  const kind={}; let free=ROLLS.slice();
  for(const k of PLACE_ORDER){ if(!t[k]) continue;
    const want=t[k]/100*216;
    // rolls the real charts used most for this box; ties go to the roll with fewer ways to come up
    const cand=free.slice().sort((x,y)=>{ const ax=aggOf(pk,x), ay=aggOf(pk,y); return ay[AGGI[k]]/ay[0]-ax[AGGI[k]]/ax[0] || OFFP[x]-OFFP[y] || x-y; });
    let got=0;
    for(const R of cand){ if(got>=want*.9) break; if(aggOf(pk,R)[AGGI[k]]===0 && k!=="INC") continue;
      if(got+OFFP[R]>want*1.2) continue; kind[R]=k; got+=OFFP[R]; }
    if(!got){ const R=cand.filter(R=>OFFP[R]<=Math.max(1,want*1.5))[0]; if(R) kind[R]=k; }
    free=free.filter(R=>!kind[R]);
  }
  return {kind,free};
}
function penBox(pk,R){ const pass=PLAYS[pk].cat==="pass";
  if(R===19||R===29||R===39) return pass?{k:"pen",side:"PI",yds:PIY[pk]||15,fd:true}:{k:"pen",side:"DEF",yds:15,fd:true};
  if(R<20) return R%2?{k:"pen",side:"DEF",yds:5}:{k:"pen",side:"OFF",yds:pk==="LP"?5:10};
  return R%2?{k:"pen",side:"DEF",yds:5}:{k:"pen",side:"OFF",yds:5}; }
const INTY={SC:2,SP:7,MP:14,LG:30,SL:9};
const PIY={SC:8,SP:10,MP:20,LG:35,SL:12,HM:35};   // pass interference is a spot foul: deeper pass, more yards
// Yard boxes use the grouped layout: the 30s (half of all rolls) hold the everyday gains,
// 20-24 just below and 25-29 just above, the rare 10s the extremes.
function yardRows(pk,team,rolls){
  const r=RATE[team][pk]||0;
  return bandsToRows(rolls,BANDS[pk].map(b=>({p:b.p,k:"y",lo:b.lo+r,hi:b.hi+2*r})));
}
const CHART={};
function buildCharts(){
  for(const team of ["KC","PHI"]){
    CHART[team]={};
    for(const pk of OFF_ORDER){
      const {kind,free}=placeBoxes(pk,team); const yr=yardRows(pk,team,free); const col={}; const pass=PLAYS[pk].cat==="pass";
      ROLLS.forEach(R=>{ const k=kind[R]; let c;
        if(!k) c=yr[R];
        else if(k==="INC") c={k:"inc"};
        else if(k==="QT") c={k:"qt"};
        else if(k==="B") c={k:"b"};
        else if(k==="TD") c={k:"b"};
        else if(k==="INT") c={k:"int",y:INTY[pk]||7};
        else if(k==="F") c={k:"f",y:pass?2:(R%2?-1:1)};
        else c=penBox(pk,R);
        if(c.k==="y"){
          if(pk==="LP" && c.y>=1 && c.y<=3 && (team==="PHI"||R%2===1)) c.paren=true;   // power push the defense can't stop
          const a=aggOf(pk,R); if(c.y>0 && (pk==="SL" || a[8]/a[0]>=.15)) c.ob=true;
        }
        col[R]=c; });
      CHART[team][pk]=col;
    }
    // Quarterback trapped: offense rolls again on this column.
    const qtB = team==="KC"
      ? [{p:18,k:"y",lo:-10,hi:-5},{p:14,k:"y",lo:-4,hi:-1},{p:24,k:"inc"},{p:20,k:"y",lo:0,hi:6},{p:15,k:"y",lo:7,hi:14},{p:9,k:"y",lo:15,hi:28}]
      : [{p:34,k:"y",lo:-10,hi:-5},{p:24,k:"y",lo:-4,hi:-1},{p:10,k:"inc"},{p:14,k:"y",lo:0,hi:7},{p:12,k:"y",lo:8,hi:15},{p:6,k:"y",lo:16,hi:30}];
    const qr=bandsToRows(ROLLS.filter(R=>R!==10&&R!==20),qtB); qr[10]={k:"f",y:-8}; qr[20]={k:"f",y:-6};
    ROLLS.forEach(R=>{ if(qr[R].k==="y"&&qr[R].y>0) qr[R].scr=true; if(qr[R].k==="y"&&qr[R].y<0) qr[R].sack=true; });
    CHART[team].QT=qr;
    // Breakaway: offense rolls again on this column.
    const bk=bandsToRows(ROLLS,[{p:40,k:"y",lo:15,hi:30},{p:30,k:"y",lo:31,hi:50},{p:18,k:"y",lo:51,hi:75},{p:12,k:"td"}]);
    CHART[team].B=bk;
    // Interception return (the team that picked it off rolls).
    const ir=bandsToRows(ROLLS.filter(R=>R!==39),[{p:30,k:"y",lo:0,hi:0},{p:35,k:"y",lo:1,hi:10},{p:25,k:"y",lo:11,hi:25},{p:10,k:"y",lo:26,hi:45}]); ir[39]={k:"td"};
    CHART[team].IR=ir;
    // Kickoff return (receiving team's starting yard line). 39 = return TD.
    // Kickoff, two rolls like the real game: the kicking team rolls its Kickoff column (touchback or a
    // returnable kick), then the receiving team rolls its Kickoff Return column for where they start.
    CHART[team].KO=bandsToRows(ROLLS,[{p:45,k:"kret"},{p:55,k:"tb"}]);
    const kr=bandsToRows(ROLLS.filter(R=>R!==39),[{p:28,k:"y",lo:12,hi:20},{p:42,k:"y",lo:21,hi:28},{p:22,k:"y",lo:29,hi:38},{p:8,k:"y",lo:39,hi:55}]); kr[39]={k:"td"}; kr[10]={k:"f",y:0};
    CHART[team].KR=kr;
    // Punt (net yards). 10 = blocked. 39 = long return (net 10).
    // Punt, two rolls: the punting team rolls its Punt column (how far it goes, 10 = blocked), then the
    // receiving team rolls its Punt Return column (FC = fair catch, F = muffed/fumbled, 39 = return TD).
    const pu=bandsToRows(ROLLS.filter(R=>R!==10),[{p:30,k:"y",lo:36,hi:43},{p:40,k:"y",lo:44,hi:48},{p:30,k:"y",lo:49,hi:58}]); pu[10]={k:"blk"};
    CHART[team].PU=pu;
    const pr=bandsToRows(ROLLS.filter(R=>R!==10&&R!==39),[{p:36,k:"fc"},{p:30,k:"y",lo:0,hi:6},{p:22,k:"y",lo:7,hi:12},{p:12,k:"y",lo:13,hi:30}]); pr[10]={k:"f",y:0}; pr[39]={k:"td"};
    CHART[team].PR=pr;
    // Field goal: longest kick that is good. 10 = blocked.
    const fg={}; let acc=0; const tot=216;
    ROLLS.forEach(R=>{ const q=(acc+OFFP[R]/2)/tot; acc+=OFFP[R];
      // success curve: 25 yds ~99%, 35 ~ 92%, 45 ~ 78%, 50 ~ 60%, 55 ~ 35%, 60 ~ 12%
      const pts=[[0,20],[.02,25],[.08,35],[.22,45],[.40,50],[.65,55],[.88,60],[1,64]];
      let d=20; for(let i=1;i<pts.length;i++){ if(q<=pts[i][0]){ const [q0,d0]=pts[i-1],[q1,d1]=pts[i]; d=Math.round(d0+(d1-d0)*(q-q0)/(q1-q0)); break; } }
      fg[R]=R===10?{k:"blk"}:{k:"y",y:d}; });
    CHART[team].FG=fg;
    // QB sneak: offense rolls this column. About 4 in 5 get at least a yard.
    const qs={}; ROLLS.forEach(R=>{ qs[R]=R===10?{k:"f",y:0}:R<=21?{k:"y",y:0}:R<=36?{k:"y",y:1}:R<=38?{k:"y",y:2}:{k:"y",y:3}; }); CHART[team].QS=qs;
    // Hail Mary: mostly knocked down; a few big catches, a rare touchdown, a rare flag.
    const hm={}; ROLLS.forEach(R=>{ hm[R]=R<=12?{k:"int",y:45}:(R===28||R===29)?{k:"pen",side:"PI",yds:35,fd:true}:R<=36?{k:"inc"}:R===37?{k:"y",y:40}:R===38?{k:"y",y:55}:{k:"y",y:99,paren:true,td:true}; }); CHART[team].HM=hm;
    // Blocked kick: the team that blocked it rolls. KEEP = the kicking team falls on it.
    const bkc={}; ROLLS.forEach(R=>{ bkc[R]=R<=13?{k:"keep"}:R<=29?{k:"y",y:0,plain:true}:R<=36?{k:"y",y:(R-29)*3,plain:true}:{k:"td"}; }); CHART[team].BK=bkc;
    // Extra point: red box = no good.
    const xp={}; ROLLS.forEach(R=>xp[R]=R<=11?{k:"ng"}:{k:"ok"}); CHART[team].XP=xp;
    ["KR","PU","PR","FG","IR","B"].forEach(k=>ROLLS.forEach(R=>{ const c=CHART[team][k][R]; if(c&&c.k==="y") c.plain=true; }));
  }
}
buildCharts();
// Fumble recovery: the team that fumbled rolls. Keeps it on these rolls.
const FUMKEEP=R=>R<=28;
// Fumble line: 10-28 the fumbling team keeps it; 29-39 lost, and the bigger the roll the longer the return.
function FMBOX(R){ if(R<=28) return {k:"keep"}; if(R<=33) return {k:"lost",y:0}; if(R<=36) return {k:"lost",y:(R-33)*5}; if(R<=38) return {k:"lost",y:R===37?20:30}; return {k:"lost",td:true}; }
const fmTxt=c=>c.k==="keep"?"KEEP":c.td?"LOST TD":c.y?`LOST +${c.y}`:"LOST";

// Defense chart box: what defense roll D (1-5) does to play pk under formation dk.
// How hard each play swings with the defense (long passes swing most, the line plunge least).
const DSCALE={LP:.5,OT:.75,ER:1,DR:1,SC:1,SP:1,MP:1.5,LG:2.5,SL:1};
function defBox(pk,dk,D){
  if(pk==="QS"){ const stack=dk==="B"||dk==="F"; return [null,{k:"y",y:0},{k:"y",y:0},{k:"y",y:stack?-1:0},{k:"y",y:stack?-1:0},{k:"y",y:-1,paren:true}][D]; }
  if(pk==="HM"){ if(dk==="E") return D>=2?{k:"inc"}:{k:"y",y:0}; if(D===5) return {k:"int",y:45}; if(D===4) return {k:"inc"}; if(dk==="F"&&D===3) return {k:"qt"}; return {k:"y",y:0}; }
  const p=PLAYS[pk]; const M=GRID[pk][dk]; const pass=p.cat==="pass"; const k=DSCALE[pk];
  const Y=(v,paren)=>({k:"y",y:Math.round(v*k)||0,paren:!!paren});
  const TD={k:"y",y:99,paren:true,td:true};
  // Blitz: gets home on deep drops, but a rare 5 means it got burned for a touchdown (as on the 1983 charts).
  if(dk==="F" && D===5 && pk==="LG") return TD;
  if(dk==="F" && D===5 && pk==="SL") return {k:"y",y:15,paren:true};
  if(dk==="F" && D===5 && pk==="MP") return {k:"y",y:20,paren:true};
  if(dk==="F" && pass && pk!=="SC" && D>=4) return {k:"qt"};
  if(dk==="F" && pass && pk!=="SC" && D===3) return Y(-3);
  // Screen and draw are built to beat the blitz: the rush runs right past them.
  if(dk==="F" && (pk==="SC"||pk==="DR")) return [null,Y(2),Y(4),{k:"y",y:6,paren:true},{k:"y",y:12,paren:true},{k:"y",y:20,paren:true}][D];
  // Stacking the box for short yardage leaves nobody deep.
  // Coverage entries from the real defense charts: prevent and zones take the ball away.
  if(dk==="E" && pk==="LG"){ if(D===5) return {k:"int",y:30}; if(D===4) return {k:"inc"}; }
  if(dk==="E" && pk==="MP" && D===5) return {k:"inc"};
  if(dk==="D" && D===5 && pk==="SP") return {k:"int",y:8};
  if(dk==="C" && D===5 && pk==="SL") return {k:"int",y:12};
  if(dk==="A" && D===5 && pk==="LG") return {k:"int",y:28};
  if(dk==="B" && D===5 && pk==="LG") return TD;
  if(dk==="B" && D===5 && pk==="MP") return {k:"y",y:28,paren:true};
  if(M>=1) return Y([0,M*2,M,0,-2,-3][D]);
  if(M===0){ if(D===5) return pass?{k:"qt"}:Y(-2,true); return Y([0,1,0,-1,-3][D]); }
  const a=-M; // defense guessed right
  if(D===1) return Y(-1);
  if(D===2) return Y(-2*a);
  if(D===3) return {k:"y",y:Math.round((3-2*a)*Math.min(1,k)),paren:true};
  if(D===4) return pass?{k:"qt"}:{k:"y",y:-1-a,paren:true};
  return pass?{k:"qt"}:{k:"y",y:-3,paren:true};
}

// ---------- Resolving a play (the Paydirt priority rules) ----------
function boxTxt(c){ if(!c) return "";
  if(c.k==="y"){ if(c.td) return "(TD)"; const v=c.plain?String(c.y):(c.y>0?"+":"")+c.y; return c.paren?`(${v})`:v; }
  return ({kret:"RETURN",fc:"FC",inc:"INC",qt:"QT",b:"B",td:"TD",tb:"TB 25",blk:"BLK",ng:"NO",ok:"GOOD",ret:"RET"})[c.k]||(c.k==="int"?`INT ${c.y}`:c.k==="f"?`F ${c.y>0?"+":""}${c.y}`:c.k==="pen"?`${c.side} ${c.yds}${c.fd?"*":""}`:c.k);
}
function fmtGain(y){return y>0?`gain of ${y}`:y===0?"no gain":`loss of ${-y}`;}
// Combine an offense box and a defense box. Returns {kind, y, why, follow?}
// The real Paydirt priority chart: flags first, then fumbles, then anything special in the
// DEFENSE box ( (TD), (n), QT, black, INT ), then the offense box; two plain numbers add.
function combine(o,d,pk){
  const pass=PLAYS[pk].cat==="pass";
  if(o.k==="pen") return {kind:"pen",pen:o,why:o.side==="OFF"?`Penalty on the offense, ${o.yds} yards.`:o.side==="PI"?`Pass interference, ${o.yds} yards and a first down.`:`Penalty on the defense, ${o.yds} yards${o.fd?" and a first down":""}.`};
  if(o.k==="f") return {kind:"follow",follow:"FUM",y:o.y,why:"Fumble! The offense rolls to see who recovers."};
  if(d.k==="y"&&d.td) return {kind:"y",y:99,why:"Defense box (TD): the defense got burned. Touchdown!"};
  if(d.k==="y"&&d.paren){
    if(o.k==="y"&&o.paren) return {kind:"y",y:o.y+d.y,why:"Both boxes in ( ): add them."};
    return {kind:"y",y:d.y,why:"Defense box in ( ) overrules the offense box."};
  }
  if(d.k==="qt") return {kind:"follow",follow:"QT",why:"The rush gets home: quarterback trapped! Offense rolls on its QT column."};
  if(d.k==="inc") return pass?{kind:"inc",y:0,why:"Black defense box: covered, incomplete."}:{kind:"y",y:0,why:"Black defense box: stuffed, no gain."};
  if(d.k==="int") return {kind:"follow",follow:"INT",y:o.k==="int"?Math.min(o.y,d.y):d.y,why:"Defense box INT: picked off! Defense rolls for the return."};
  if(o.k==="b") return {kind:"follow",follow:"B",why:"Breakaway! Offense rolls on its Breakaway column."};
  if(o.k==="qt") return {kind:"follow",follow:"QT",why:"Quarterback trapped! Offense rolls on its QT column."};
  if(o.k==="int") return {kind:"follow",follow:"INT",y:o.y,why:"Intercepted! Defense rolls for the return."};
  if(o.k==="inc") return {kind:"inc",y:0,why:"Incomplete."};
  if(o.paren) return {kind:"y",y:o.y,why:"Offense box in ( ) overrules."};
  return {kind:"y",y:o.y+d.y,why:"Add the boxes."};
}
// When a flag comes up, the offense dice are rolled again for the play itself and the team that
// was fouled takes whichever is better for them (Paydirt's accept-or-decline rule).
function penaltyChoice(s,team,pk,res){
  const p=res.pen; let alt=null, R2=0;
  for(let i=0;i<20&&!alt;i++){ const dz={t:d6(),a:d6(),b:d6()}; R2=offValue(dz.t,dz.a,dz.b); const o2=CHART[team][pk][R2]; if(o2.k==="pen") continue; alt=combine(o2,res.d,pk); alt.R=R2; alt.o=o2; alt.dice=dz; }
  if(!alt) return {decline:false};
  const g=toGoal(s); let py=p.side==="OFF"?-p.yds:p.yds; if(py>0&&py>=g) py=Math.max(1,Math.floor(g/2));
  let decline=false;
  if(p.side==="OFF"){ // defense was fouled
    if(alt.kind==="follow") decline=alt.follow==="INT"||alt.follow==="FUM";
    else if(alt.kind==="inc") decline=s.down>=3;
    else decline=alt.y<=py || (s.down>=3 && alt.y<s.toGo);
  } else { // offense was fouled
    const penFirst=p.fd||py>=s.toGo;
    if(alt.kind==="follow") decline=alt.follow==="B";
    else if(alt.kind==="y") decline=alt.y>=Math.min(py,g) && (alt.y>=s.toGo || !penFirst);
  }
  return {decline,alt};
}
function resolveScrimmage(team,pk,dk,dice){
  const R=offValue(dice.t,dice.a,dice.b);
  let D=defValue(dice.d1,dice.d2)+(DEFRATE[other(team)][dk]||0); if(D>5)D=5;
  const o=CHART[team][pk][R]; const d=defBox(pk,dk,D);
  const out=combine(o,d,pk); out.R=R; out.D=D; out.o=o; out.d=d; out.ob=!!o.ob;
  return out;
}

// Every outcome of a called play vs a called defense, weighted by the real dice odds (out of 7776).
const MCACHE={};
function matchup(team,pk,dk){ const key=team+pk+dk; if(MCACHE[key]) return MCACHE[key];
  const out={ys:{},inc:0,qt:0,b:0,int:0,fum:0,pen:0,offset:0,td:0,n:216*36};
  ROLLS.forEach(R=>{ const o=CHART[team][pk][R];
    for(let nat=1;nat<=5;nat++){ const w=OFFP[R]*DEFP[nat]; let D=nat+(DEFRATE[other(team)][dk]||0); if(D>5)D=5;
      if(o.k==="pen"&&nat===5){ out.offset+=w; continue; }
      const res=combine(o,defBox(pk,dk,D),pk);
      if(res.kind==="pen") out.pen+=w; else if(res.kind==="inc") out.inc+=w;
      else if(res.kind==="follow") out[{QT:"qt",B:"b",INT:"int",FUM:"fum"}[res.follow]]+=w;
      else if(res.y>=99) out.td+=w; else out.ys[res.y]=(out.ys[res.y]||0)+w; } });
  return MCACHE[key]=out; }
// Rough expected yards of a matchup (follow-up rolls counted at their column averages), used for "best against".
function colAvg(col){ let n=0,y=0; ROLLS.forEach(R=>{ const c=col[R]; const w=OFFP[R]; n+=w; y+=w*(c.k==="y"?c.y:c.k==="td"?60:0); }); return y/n; }
function matchupEV(team,pk,dk){ const m=matchup(team,pk,dk); let y=0; for(const k in m.ys) y+=(+k)*m.ys[k];
  y+=m.td*40+m.b*colAvg(CHART[team].B)+m.qt*colAvg(CHART[team].QT)-(m.int+m.fum)*30+m.pen*4; return y/m.n; }

// ---------- Game state ----------
const other=t=>t==="KC"?"PHI":"KC";
const dir=t=>t==="KC"?1:-1;
const toGoal=(s)=>s.poss==="KC"?100-s.ball:s.ball;
function spotName(abs){ if(abs===50)return "50"; return abs<50?`KC ${abs}`:`PHI ${100-abs}`; }
function ownToAbs(team,own){return team==="KC"?own:100-own;}

function newGame(qmin,nq){
  return {v:4,rev:1,phase:"lobby",poss:null,ball:25,down:1,toGo:10,q:1,qmin:qmin||8,nq:nq||4,clock:(qmin||8)*60,running:false,to:{KC:3,PHI:3},paused:false,score:{KC:0,PHI:0},
          recv1:null,last:null,log:[],winner:null,ot:false,started:Date.now()};
}
function addLog(s,team,txt){s.log.unshift({t:team,x:txt,q:s.q});if(s.log.length>14)s.log.length=14;}
function startPossession(s,team,own){s.poss=team;s.ball=ownToAbs(team,own);s.down=1;s.toGo=Math.min(10,toGoal(s));}
function tick(s){}

// ---------- Clock ----------
// Paydirt-style timing in 10-second boxes: the snap itself uses 1 box; a running clock also burns the huddle.
const TEMPO={normal:{name:"Normal huddle",secs:30},hurry:{name:"Hurry-up",secs:10},milk:{name:"Run the clock",secs:40}};
const PLAYSECS={LP:10,OT:10,ER:10,DR:10,SC:10,SP:10,MP:10,LG:10,SL:10,PUNT:10,FG:10,KO:10,SPIKE:0,KNEEL:10};
const fmtClock=c=>{c=Math.max(0,Math.round(c));return Math.floor(c/60)+":"+String(c%60).padStart(2,"0");};
const twoMinQ=s=>!s.ot&&(s.q===s.nq||(s.nq>=2&&s.q===s.nq/2));
function preSnap(s,tempo){ return s.running?(TEMPO[tempo]||TEMPO.normal).secs:0; }
function runClock(s,pk,tempo,stopAfter){
  const c0=s.clock; let c=c0; let warned=false;
  if(s.running){ const c1=c-preSnap(s,tempo); if(twoMinQ(s)&&!s.warned&&c>120&&c1<=120){ c=120; warned=true; } else c=c1; }
  const cBeforePlay=c; c-= (PLAYSECS[pk]!=null?PLAYSECS[pk]:10);
  if(twoMinQ(s)&&!s.warned&&!warned&&cBeforePlay>120&&c<=120){ warned=true; }
  s.clock=Math.max(0,c); s.running=!stopAfter;
  if(warned){ s.warned=true; s.running=false; addLog(s,null,"Two-minute warning. Clock stops."); }
  s.untimed=false;
  if(s.clock<=0){
    // A period can't end on an accepted defensive penalty: the offense gets one untimed down.
    if(s.last&&s.last.defFlag&&s.phase==="play"&&!s.follow){ s.untimed=true; s.running=false; s.last.txt+=" Time ran out on a defensive penalty, so the offense gets one untimed down."; addLog(s,null,"Untimed down: the period can't end on a defensive penalty."); }
    else endQuarter(s);
  }
}
function endQuarter(s){
  s.running=false; s.warned=false;
  if(s.ot){ addLog(s,null,"End of the overtime period. Still tied, another period."); s.clock=s.qmin*60; return; }
  if(s.nq>=2&&s.q===s.nq/2){ s.q++; s.clock=s.qmin*60; s.to={KC:3,PHI:3}; s.halfPending=true; addLog(s,null,"Halftime! Timeouts reset to 3."); return; }
  if(s.q>=s.nq){ s.endPending=true; addLog(s,null,"0:00. End of regulation."); return; }
  s.q++; s.clock=s.qmin*60; addLog(s,null,`End of quarter. Q${s.q} starts.`);
}
function endGame(s){ s.phase="over"; s.winner=s.score.KC>s.score.PHI?"KC":s.score.PHI>s.score.KC?"PHI":"TIE"; addLog(s,null,`Final: KC ${s.score.KC}, PHI ${s.score.PHI}`); }
function afterPlay(s){
  if(s.phase==="pat"||s.phase==="over") return;
  // Overtime (NFL playoff rules): each team gets one full possession, then sudden death.
  if(s.ot&&s.otDone){
    const ended = s.phase==="kickoff" ? s.kicker : (s.otPrev && s.poss && s.poss!==s.otPrev ? s.otPrev : null);
    if(ended) s.otDone[ended]=true;
    s.otPrev = s.phase==="kickoff" ? null : s.poss;
    if(s.otDone.KC && s.otDone.PHI && s.score.KC!==s.score.PHI){ endGame(s); return; }
  }
  if(s.endPending){ s.endPending=false;
    if(s.score.KC===s.score.PHI){ s.q=s.nq+1; s.ot=true; s.otDone={KC:false,PHI:false}; s.otPrev=null; s.clock=s.qmin*60; s.to={KC:3,PHI:3}; s.phase="kickoff"; s.kicker=Math.random()<.5?"KC":"PHI"; s.poss=null;
      addLog(s,null,`Tied! Overtime, playoff rules. ${TEAMS[other(s.kicker)].name} win the toss and receive. Both teams get the ball at least once; if it's still tied after that, next score wins.`); }
    else endGame(s);
    return; }
  if(s.halfPending){ s.halfPending=false; s.phase="kickoff"; s.kicker=s.recv1; s.poss=null; addLog(s,null,`Second half: ${TEAMS[s.recv1].name} kick off.`); }
}
function scored(s,team,pts,what){
  s.score[team]+=pts; addLog(s,team,`${TEAMS[team].name} ${what} (+${pts})`);
  return false;
}
function touchdown(s,team,txt){
  s.ball=team==="KC"?100:0; s.last.cls="td"; s.last.ev="td"; s.last.team=team; s.last.txt=txt+" TOUCHDOWN!"; addLog(s,team,s.last.txt);
  s.poss=team; scored(s,team,6,"touchdown"); s.phase="pat"; s.ball=ownToAbs(team,98);
}

// Step 1 of a scrimmage play. May leave s.follow set, which needs one more roll.
// Sideline call: "out" = get out of bounds (clock stops, costs up to 5 yards unless the box was already *),
// "in" = stay in bounds (clock keeps running, costs up to 5 yards only when the box was *). A touchdown always stands.
function designate(s,y,ob,des){
  if(!des||!(y>0)||y>=toGoal(s)) return {y,stop:!!ob,note:""};
  if(des==="out"){ if(ob) return {y,stop:true,note:""}; const y2=Math.max(0,y-5); return {y:y2,stop:true,note:` Heads for the sideline: ${y-y2} yard${y-y2===1?"":"s"} given up to stop the clock.`}; }
  if(!ob) return {y,stop:false,note:""}; const y2=Math.max(0,y-5); return {y:y2,stop:false,note:` Stays in bounds to keep the clock running: ${y-y2} yard${y-y2===1?"":"s"} given up.`};
}
function gainDesig(s,y,txt,ob,des){
  const r=designate(s,y,ob,des); gainYards(s,r.y,txt.replace("{G}",fmtGain(r.y))+r.note,r.stop&&r.y>0);
  if(r.stop&&r.y<=0&&!s.last.cls){ s.last.txt+=" Out of bounds, clock stops."; s.last.stop=true; if(s.log[0]) s.log[0].x=s.last.txt; }
}
function applyScrimmage(s,pk,dk,dice,des){
  const team=s.poss; let res=resolveScrimmage(team,pk,dk,dice);
  s.last={team,pk,dk,dice,R:res.R,D:res.D,o:res.o,d:res.d,why:res.why,txt:"",cls:"",from:s.ball,des:des||null};
  const head=`${TEAMS[team].short} ${PLAYS[pk].name} vs ${DEFS[dk].short}:`;
  // Offsetting flags: a flag in the offense box plus a natural 5 on the defense dice (red 3 + green 2).
  if(res.kind==="pen" && defValue(dice.d1,dice.d2)===5){
    s.last.why="Flag in the offense box and a natural 5 on the defense dice: flags on both teams.";
    s.last.txt=`${head} FLAGS on both teams. Offsetting penalties, replay the down.`; s.last.ev="flag"; s.last.stop=true; s.last.y=0; s.last.offset=true;
    addLog(s,team,s.last.txt); return; }
  if(res.kind==="follow"){
    s.follow={kind:res.follow,team:res.follow==="INT"?other(team):team,pk,y:res.y,los:s.ball};
    s.last.txt=`${head} ${res.why}`; s.last.ev=res.follow==="QT"?"qt":res.follow==="B"?"brk":res.follow==="INT"?"int":"fum"; s.last.stop=true; s.last.wait=true;
    addLog(s,team,s.last.txt); return;
  }
  if(res.kind==="pen"){
    const ch=penaltyChoice(s,team,pk,res); const fouled=res.pen.side==="OFF"?other(team):team; const alt=ch.alt;
    const altTxt=alt?(alt.kind==="inc"?"incomplete":alt.kind==="y"?fmtGain(alt.y):alt.follow==="B"?"a breakaway":alt.follow==="QT"?"QB trapped":alt.follow==="INT"?"an interception":"a fumble"):"";
    if(!ch.decline){ applyPenalty(s,res.pen,head); if(alt){ s.last.txt+=` (The play itself, roll ${alt.R}, was ${altTxt}. ${TEAMS[fouled].name} take the flag.)`; if(s.log[0]) s.log[0].x=s.last.txt; } return; }
    const note=`Flag on the ${res.pen.side==="OFF"?"offense":"defense"} (${boxTxt(res.pen)}), but the play itself (roll ${alt.R}) was ${altTxt}, so the ${TEAMS[fouled].name} decline it.`;
    s.last.R=alt.R; s.last.o=alt.o; s.last.why=note; s.last.declined=true;
    res=alt; res.why=note;
    if(res.kind==="follow"){
      s.follow={kind:res.follow,team:res.follow==="INT"?other(team):team,pk,y:res.y,los:s.ball};
      s.last.txt=`${head} ${note}`; s.last.ev=res.follow==="QT"?"qt":res.follow==="B"?"brk":res.follow==="INT"?"int":"fum"; s.last.stop=true; s.last.wait=true;
      addLog(s,team,s.last.txt); return;
    }
    if(res.kind==="inc"){ s.last.txt=`${head} ${note} Incomplete.`; s.last.ev="inc"; s.last.stop=true; s.down++; turnoverOnDowns(s); addLog(s,team,s.last.txt); return; }
    gainDesig(s,res.y,`${head} ${note} ${PLAYS[pk].cat==="pass"?"Complete, ":""}{G}.`,alt.o&&alt.o.ob,des); return;
  }
  if(res.kind==="inc"){ s.last.txt=`${head} Incomplete.`; s.last.ev="inc"; s.last.stop=true; s.down++; turnoverOnDowns(s); addLog(s,team,s.last.txt); return; }
  gainDesig(s,res.y,head+" "+(PLAYS[pk].cat==="pass"?"Complete, ":"")+"{G}.",res.ob,des);
}
function turnoverOnDowns(s){
  if(s.down>4){ const def=other(s.poss); s.last.txt+=" Turnover on downs."; s.poss=def; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.cls="to"; s.last.ev=s.last.ev||"downs"; s.last.stop=true; }
}
// Move the ball y yards for the offense and handle TD / safety / downs.
function gainYards(s,y,txt,ob){
  const team=s.poss, def=other(team);
  s.ball+=dir(team)*y; s.last.y=y;
  const g=toGoal(s);
  if(g<=0){ touchdown(s,team,txt); return; }
  if(g>=100){ s.ball=ownToAbs(team,0); s.last.txt=txt+" SAFETY!"; s.last.cls="to"; s.last.ev="safety"; addLog(s,team,s.last.txt);
    if(scored(s,def,2,"safety"))return; s.phase="kickoff"; s.kicker=team; s.freeKick=true; return; }
  if(y>=s.toGo){ s.down=1; s.toGo=Math.min(10,g); txt+=" First down!"; s.last.ev=s.last.ev||"first"; }
  else { s.toGo-=y; s.down++; if(y<0&&s.last.qtSack) s.last.ev="sack"; }
  s.last.txt=txt; turnoverOnDowns(s);
  if(ob && y>0 && !s.last.cls){ s.last.txt+=" Out of bounds, clock stops."; s.last.stop=true; }
  if(s.last.cls) s.last.stop=true;
  addLog(s,team,s.last.txt);
}
function applyPenalty(s,p,head){
  const team=s.poss; const g=toGoal(s);
  let y=p.side==="OFF"?-p.yds:p.yds;
  if(y>0 && y>=g) y=Math.max(1,Math.floor(g/2));
  if(y<0 && -y>=(100-g)) y=-Math.floor((100-g)/2);
  s.ball+=dir(team)*y; s.last.ev="flag"; s.last.stop=true; s.last.y=y; s.last.defFlag=p.side!=="OFF";
  let txt=`${head} FLAG! ${p.side==="OFF"?(p.yds===5?"False start":"Holding")+" on the offense":p.side==="PI"?"Pass interference on the defense":p.yds===5?"Offside on the defense":"Personal foul on the defense"}, ${Math.abs(y)} yards.`;
  if(p.fd||(y>0&&y>=s.toGo)){ s.down=1; s.toGo=Math.min(10,toGoal(s)); txt+=" Automatic first down."; }
  else { s.toGo-=y; txt+=" Replay the down."; }
  s.last.txt=txt; addLog(s,team,txt);
}
// Step 2: the follow-up roll (QT, breakaway, fumble recovery, interception return).
function applyFollow(s,dice){
  const f=s.follow; s.follow=null; const R=offValue(dice.t,dice.a,dice.b);
  const off=s.poss, def=other(off);
  s.last.fol={kind:f.kind,R,team:f.team,dice}; s.last.wait=false; s.last.from=f.los;
  if(f.kind==="PR"){ const c=CHART[off].PR[R]; s.last.fol.box=c; s.last.stop=true;
    if(c.k==="td"){ touchdown(s,off,`Punt RETURNED all the way by the ${TEAMS[off].name}!`); return; }
    if(c.k==="f"){ s.follow={kind:"FUM",team:off,pk:"PUNT",y:0,los:s.ball}; s.last.wait=true; s.last.ev="fum"; s.last.txt=`MUFFED PUNT! The ball is loose. ${TEAMS[off].name} roll the fumble line.`; addLog(s,off,s.last.txt); return; }
    if(c.k==="fc"){ s.last.txt=`Fair catch. ${TEAMS[off].name} ball at ${spotName(s.ball)}.`; s.last.ev="punt"; addLog(s,off,s.last.txt); return; }
    s.ball+=dir(off)*c.y; if(toGoal(s)<=0){ touchdown(s,off,`Punt RETURNED all the way by the ${TEAMS[off].name}!`); return; }
    s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.txt=`${c.y>=13?"Big return! ":""}Returned ${c.y} yards. ${TEAMS[off].name} ball at ${spotName(s.ball)}.`; s.last.ev="punt"; addLog(s,off,s.last.txt); return; }
  if(f.kind==="BK"){ const c=CHART[def].BK[R]; s.last.fol.box=c; s.last.stop=true; const what=f.pk==="FG"?"blocked field goal":"blocked punt";
    if(c.k==="keep"){ const lost=Math.abs(s.ball-f.los); s.ball=f.los;
      if(f.pk==="PUNT"&&s.down<4){ s.down++; s.toGo+=lost; s.last.ev="recover"; s.last.txt=`${TEAMS[off].name} fall on the ${what} at ${spotName(s.ball)}. They keep it: ${ord4(s.down)} and ${s.toGo}.`; addLog(s,off,s.last.txt); return; }
      s.poss=def; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.cls="to"; s.last.ev="turnover"; s.last.txt=`${TEAMS[off].name} fall on the ${what}, but it's ${f.pk==="FG"?"a turnover":"short of the line on 4th down"}. ${TEAMS[def].name} ball at ${spotName(s.ball)}.`; addLog(s,off,s.last.txt); return; }
    s.poss=def; s.last.cls="to"; s.last.ev="turnover";
    if(c.k==="td"){ touchdown(s,def,`${TEAMS[def].name} scoop up the ${what} and take it to the house!`); return; }
    let nb=f.los-dir(off)*c.y; if((def==="KC"&&nb>=100)||(def==="PHI"&&nb<=0)){ touchdown(s,def,`${TEAMS[def].name} scoop up the ${what} and take it to the house!`); return; }
    nb=Math.max(1,Math.min(99,nb)); s.ball=nb; s.down=1; s.toGo=Math.min(10,toGoal(s));
    s.last.txt=`${TEAMS[def].name} recover the ${what}${c.y?` and return it ${c.y}`:""}. ${TEAMS[def].name} ball at ${spotName(nb)}.`; addLog(s,off,s.last.txt); return; }
  if(f.kind==="FUM"&&(f.pk==="KO"||f.pk==="PUNT")){ const fb=FMBOX(R); s.last.fol.box=fb; const what=f.pk==="KO"?"kick return":"punt return";
    if(FUMKEEP(R)){ s.ball=f.los; s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.ev="recover"; s.last.txt=`${TEAMS[off].name} fall on their own fumble on the ${what}! Ball at ${spotName(s.ball)}.`; addLog(s,off,s.last.txt); return; }
    s.last.cls="to"; s.last.ev="turnover"; s.last.stop=true;
    if(fb.td){ s.poss=def; touchdown(s,def,`Fumble on the ${what}! Scooped up by the ${TEAMS[def].name} for a touchdown!`); return; }
    let nb=f.los-dir(off)*fb.y; if((def==="KC"&&nb>=100)||(def==="PHI"&&nb<=0)){ s.poss=def; touchdown(s,def,`Fumble on the ${what}! Scooped up by the ${TEAMS[def].name} for a touchdown!`); return; }
    s.poss=def; s.ball=Math.max(1,Math.min(99,nb)); s.down=1; s.toGo=Math.min(10,toGoal(s)); s.last.txt=`FUMBLE on the ${what}! ${TEAMS[def].name} recover${fb.y?` and return it ${fb.y}`:""} at ${spotName(s.ball)}.`; addLog(s,off,s.last.txt); return; }
  if(f.kind==="KR"){ const c=CHART[off].KR[R]; s.last.fol.box=c; s.last.pk="KO";
    if(c.k==="f"){ startPossession(s,off,20); s.follow={kind:"FUM",team:off,pk:"KO",y:0,los:s.ball}; s.last.wait=true; s.last.ev="fum"; s.last.txt=`FUMBLE on the kick return! ${TEAMS[off].name} roll the fumble line.`; addLog(s,off,s.last.txt); return; }
    if(c.k==="td"){ touchdown(s,off,`Kickoff RETURNED all the way by the ${TEAMS[off].name}!`); return; }
    startPossession(s,off,c.y); s.last.txt=`${c.y>=39?"Big return! ":""}${TEAMS[off].name} return it to their ${c.y}.`; s.last.ev="kick"; addLog(s,off,s.last.txt); return; }
  const head=`${TEAMS[off].short} ${PLAYS[f.pk]?PLAYS[f.pk].name:f.pk==="KO"?"kick return":"punt return"}:`;
  if(f.kind==="B"){ const c=CHART[off].B[R]; s.last.fol.box=c;
    if(c.k==="td"){ touchdown(s,off,`${head} Breakaway, nobody catches him!`); s.last.ev="td"; return; }
    s.last.ev="brk"; gainYards(s,c.y,`${head} Breakaway! Gain of ${c.y}.`); if(s.last.ev==="first") s.last.ev="brk"; return; }
  if(f.kind==="QT"){ const c=CHART[off].QT[R]; s.last.fol.box=c;
    if(c.k==="inc"){ s.last.txt=`${head} Quarterback trapped, throws it away. Incomplete.`; s.last.ev="inc"; s.last.stop=true; s.down++; turnoverOnDowns(s); addLog(s,off,s.last.txt); return; }
    if(c.k==="f"){ s.follow={kind:"FUM",team:off,pk:f.pk,y:c.y,los:f.los}; s.last.txt=`${head} Strip sack! Fumble at ${fmtGain(c.y).replace("gain of ","+").replace("loss of ","−")}. The offense rolls to see who recovers.`; s.last.ev="fum"; s.last.wait=true; addLog(s,off,s.last.txt); return; }
    s.last.qtSack=c.y<0; const t=c.y<0?`Quarterback trapped, SACKED for a loss of ${-c.y}.`:c.y===0?"Quarterback trapped, scrambles back to the line. No gain.":`Quarterback trapped, scrambles for ${c.y}!`;
    gainYards(s,c.y,`${head} ${t}`, c.y>0 && R%2===1); if(c.y<0&&!s.last.cls) s.last.ev="sack"; else if(c.y>=0&&s.last.ev!=="first"&&!s.last.cls) s.last.ev="scramble"; return; }
  if(f.kind==="FUM"){ const spot=f.los+dir(off)*f.y; const fb=FMBOX(R); s.last.fol.box=fb;
    if(FUMKEEP(R)){ s.ball=f.los; gainYards(s,f.y,`${head} Fumble... recovered by the ${TEAMS[off].name}! ${fmtGain(f.y)[0].toUpperCase()+fmtGain(f.y).slice(1)}.`); if(!s.last.cls&&s.last.ev!=="first") s.last.ev="recover"; return; }
    s.last.cls="to"; s.last.ev="turnover"; s.last.stop=true;
    const sp=Math.max(1,Math.min(99,spot));
    if(fb.td){ s.poss=def; touchdown(s,def,`${head} Fumble! Scooped up by the ${TEAMS[def].name} and returned all the way!`); return; }
    const ret=fb.y; let nb=sp-dir(off)*ret; if((def==="KC"&&nb>=100)||(def==="PHI"&&nb<=0)){ s.poss=def; touchdown(s,def,`${head} Fumble! Scooped up by the ${TEAMS[def].name} and returned all the way!`); return; } nb=Math.max(1,Math.min(99,nb));
    s.poss=def; s.ball=nb; s.down=1; s.toGo=Math.min(10,toGoal(s));
    s.last.txt=`${head} FUMBLE! ${TEAMS[def].name} recover${ret?` and return it ${ret}`:""}. ${TEAMS[def].name} ball at ${spotName(nb)}.`; addLog(s,off,s.last.txt); return; }
  if(f.kind==="INT"){ const c=CHART[def].IR[R]; s.last.fol.box=c; s.last.cls="to"; s.last.ev="int"; s.last.stop=true;
    let sp=f.los+dir(off)*f.y; if((off==="KC"&&sp>=100)||(off==="PHI"&&sp<=0)){ s.poss=def; s.ball=ownToAbs(def,20); s.down=1; s.toGo=10; s.last.txt=`${head} INTERCEPTED in the end zone. Touchback, ${TEAMS[def].name} ball at their 20.`; addLog(s,off,s.last.txt); return; }
    sp=Math.max(1,Math.min(99,sp));
    if(c.k==="td"){ s.poss=def; touchdown(s,def,`${head} INTERCEPTED and returned for a pick six!`); return; }
    let nb=sp-dir(off)*c.y;
    if((def==="KC"&&nb>=100)||(def==="PHI"&&nb<=0)){ s.poss=def; touchdown(s,def,`${head} INTERCEPTED and returned for a pick six!`); return; }
    nb=Math.max(1,Math.min(99,nb)); s.poss=def; s.ball=nb; s.down=1; s.toGo=Math.min(10,toGoal(s));
    s.last.txt=`${head} INTERCEPTED! Returned ${c.y} yards. ${TEAMS[def].name} ball at ${spotName(nb)}.`; addLog(s,off,s.last.txt); return; }
}

// ---------- Kicks ----------
const ord4=n=>["","1st","2nd","3rd","4th"][n]||n+"th";
const COFFIN=8;   // coffin-corner punt: aim for the sideline, 8 yards shorter, no return
function applyPunt(s,dice,coffin){
  const team=s.poss, def=other(team); const R=offValue(dice.t,dice.a,dice.b); const c=CHART[team].PU[R];
  let txt; s.last={team,pk:"PUNT",dice,R,txt:"",cls:"",from:s.ball,o:c,ev:"punt",stop:true,coffin:!!coffin};
  if(c.k==="blk"){ const spot=Math.max(1,Math.min(99,s.ball-dir(team)*7)); s.follow={kind:"BK",team:def,pk:"PUNT",los:spot}; s.last.wait=true; s.last.cls="to"; s.last.ev="block";
    txt=`${TEAMS[team].short} punt BLOCKED! The ball is loose at ${spotName(spot)}. ${TEAMS[def].name} roll the blocked-kick line.`; }
  else if(coffin){
    const yds=Math.max(20,c.y-COFFIN); let land=s.ball+dir(team)*yds;
    if((team==="KC"&&land>=100)||(team==="PHI"&&land<=0)){ land=ownToAbs(def,20); txt=`${TEAMS[team].short} goes for the coffin corner, but ${yds} yards carries into the end zone. Touchback, ${TEAMS[def].name} ball at ${spotName(land)}.`; }
    else txt=`${TEAMS[team].short} coffin-corner punt, ${yds} yards (${c.y} minus ${COFFIN}), out of bounds at ${spotName(land)}. No return.`;
    s.poss=def; s.ball=land; s.down=1; s.toGo=Math.min(10,toGoal(s));
  }
  else{
    let land=s.ball+dir(team)*c.y;
    if((team==="KC"&&land>=100)||(team==="PHI"&&land<=0)){ land=ownToAbs(def,20); s.poss=def; s.ball=land; s.down=1; s.toGo=10; txt=`${TEAMS[team].short} punts ${c.y} yards into the end zone. Touchback, ${TEAMS[def].name} ball at ${spotName(land)}.`; }
    else { s.poss=def; s.ball=land; s.down=1; s.toGo=Math.min(10,toGoal(s));
      s.follow={kind:"PR",team:def,pk:"PUNT",los:land}; s.last.wait=true;
      txt=`${TEAMS[team].short} punts ${c.y} yards to the ${spotName(land)}. ${TEAMS[def].name} roll the return.`; }
  }
  s.last.txt=txt; addLog(s,team,txt);
}
// Share of offense boxes that stop the clock (incomplete, out of bounds, flag, turnover; about half of QTs).
function clockStopPct(team,pk){ let n=0; ROLLS.forEach(R=>{ const c=CHART[team][pk][R]; let s=0;
  if(c.k==="inc"||c.k==="pen"||c.k==="int"||c.k==="f") s=1; else if(c.k==="qt") s=.45; else if(c.k==="y"&&c.ob) s=1; n+=s*OFFP[R]; }); return Math.round(n/216*100); }
function fgNeed(dist,team){ let best=99; ROLLS.forEach(R=>{ const c=CHART[team||"KC"].FG[R]; if(c.k==="y"&&c.y>=dist&&R<best) best=R; }); return best; }
function fgChance(dist,team){ let n=0; ROLLS.forEach(R=>{ const c=CHART[team].FG[R]; if(c.k==="y"&&c.y>=dist) n+=OFFP[R]; }); return Math.round(n/216*100); }
function applyFG(s,dice){
  const team=s.poss, def=other(team); const R=offValue(dice.t,dice.a,dice.b);
  const dist=toGoal(s)+17; const c=CHART[team].FG[R];
  s.last={team,pk:"FG",dice,R,txt:"",cls:"",o:c,from:s.ball};
  if(c.k==="y"&&c.y>=dist){
    const txt=`${TEAMS[team].short} ${dist}-yard field goal is GOOD! (box says good to ${c.y})`;
    s.last.txt=txt; s.last.cls="td"; s.last.ev="fg"; addLog(s,team,txt);
    if(scored(s,team,3,"field goal"))return;
    s.phase="kickoff"; s.kicker=team; return;
  }
  if(c.k==="blk"){ const spot=Math.max(1,Math.min(99,s.ball-dir(team)*7)); s.follow={kind:"BK",team:def,pk:"FG",los:spot}; s.last.wait=true; s.last.cls="to"; s.last.ev="block"; s.last.stop=true;
    s.last.txt=`${TEAMS[team].short} ${dist}-yard field goal is BLOCKED! The ball is loose at ${spotName(spot)}. ${TEAMS[def].name} roll the blocked-kick line.`; addLog(s,team,s.last.txt); return; }
  const nb=s.ball-dir(team)*7;
  const defOwnAtKick = def==="KC"?nb:100-nb; const ownSpot=Math.max(20,defOwnAtKick);
  s.poss=def; s.ball=ownToAbs(def,ownSpot); s.down=1; s.toGo=10;
  const txt=`${TEAMS[team].short} ${dist}-yard field goal is ${c.k==="blk"?"BLOCKED":"NO GOOD (box says "+c.y+")"}. ${TEAMS[def].name} ball at ${spotName(s.ball)}.`;
  s.last.txt=txt; s.last.cls="to"; s.last.ev="fgmiss"; addLog(s,team,txt);
}
const ONSIDE_OK=R=>R>=36;   // kicking team recovers on 36-39 (about 1 in 7)
function applyKickoff(s,dice,onside){
  const kick=s.kicker, recv=other(kick); const R=offValue(dice.t,dice.a,dice.b); const c=CHART[kick].KO[R];
  let own,txt; s.last={team:kick,pk:"KO",dice,R,txt:"",cls:"",o:c,ev:"kick",from:ownToAbs(kick,35)};
  if(onside){ s.freeKick=false; s.last.o={k:ONSIDE_OK(R)?"keep":"lost"};
    if(ONSIDE_OK(R)){ txt=`ONSIDE KICK RECOVERED by the ${TEAMS[kick].name}! (rolled ${R}; 36-39 recovers) Ball at their 45.`; startPossession(s,kick,45); s.last.ev="recover"; s.last.cls="td"; }
    else { txt=`Onside kick, ${TEAMS[recv].name} recover (rolled ${R}; needed 36-39). Ball at the ${TEAMS[kick].short} 45.`; startPossession(s,recv,55); s.last.ev="turnover"; }
    s.phase="play"; s.last.txt=txt; addLog(s,kick,txt); return; }
  if(s.freeKick){ own=Math.min(45,20+Math.max(0,R-10)); s.freeKick=false; txt=`Free kick after the safety. ${TEAMS[recv].name} start at their ${own}.`; }
  else if(c.k==="tb"){ own=25; txt=`Touchback. ${TEAMS[recv].name} start at their 25.`; }
  else { s.poss=recv; s.phase="play"; s.down=1; s.toGo=10; s.ball=ownToAbs(recv,0);
    s.follow={kind:"KR",team:recv,pk:"KO",los:ownToAbs(recv,0)}; s.last.wait=true;
    s.last.txt=`Kicked deep and returnable! ${TEAMS[recv].name} roll the return.`; addLog(s,kick,s.last.txt); return; }
  startPossession(s,recv,own); s.phase="play"; s.last.txt=txt; addLog(s,recv,txt);
}
function applyPAT(s,kind,dice,pk,dk){
  const team=s.poss; const R=offValue(dice.t,dice.a,dice.b);
  s.last={team,pk:kind,dice,R,txt:"",cls:""};
  if(kind==="XP"){
    if(CHART[team].XP[R].k==="ng"){ s.last.txt=`${TEAMS[team].short} extra point is NO GOOD! (rolled ${R}, red box)`; s.last.cls="to"; s.last.ev="fgmiss"; }
    else { s.score[team]+=1; s.last.txt=`${TEAMS[team].short} extra point is good.`; s.last.ev="xp"; }
  } else {
    const res=resolveScrimmage(team,pk,dk,dice); s.last.o=res.o; s.last.d=res.d; s.last.D=res.D; s.last.pk=pk; s.last.dk=dk; s.last.why=res.why;
    const ok=(res.kind==="y"&&res.y>=2)||(res.kind==="pen"&&res.pen.side!=="OFF")||(res.kind==="follow"&&res.follow==="B");
    if(ok){ s.score[team]+=2; s.last.txt=`${TEAMS[team].short} two-point try (${PLAYS[pk].name} vs ${DEFS[dk].short}): GOOD!`; s.last.cls="td"; s.last.ev="two"; }
    else { s.last.txt=`${TEAMS[team].short} two-point try (${PLAYS[pk].name} vs ${DEFS[dk].short}): no good.`; s.last.cls="to"; s.last.ev="fgmiss"; }
  }
  addLog(s,team,s.last.txt);
  s.phase="kickoff"; s.kicker=team;
}
