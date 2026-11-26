const fs=require('fs'); eval(fs.readFileSync('pdata.js','utf8')+fs.readFileSync('engine4.js','utf8')+`
function T(label,fn){ const s=newGame(15,4); s.phase="play"; s.score={KC:10,PHI:10}; s.endPending=true; s.last={}; afterPlay(s);
  const A=other(s.kicker), B=s.kicker; s.phase="play"; s.poss=A; afterPlay(s); fn(s,A,B); console.log(label, s.phase, JSON.stringify(s.score), JSON.stringify(s.otDone)); }
const td=(s,t)=>{ touchdown(s,t,""); afterPlay(s); applyPAT(s,"XP",{t:3,a:3,b:3},null,null); afterPlay(s); };
const recv=(s,t)=>{ s.phase="play"; s.poss=t; afterPlay(s); };
T("A TD, B punts -> over:",(s,A,B)=>{ td(s,A); recv(s,B); s.poss=A; afterPlay(s); });
T("A TD, B TD -> still OT:",(s,A,B)=>{ td(s,A); recv(s,B); td(s,B); recv(s,A); });
T("A TD, B TD, A FG -> over:",(s,A,B)=>{ td(s,A); recv(s,B); td(s,B); recv(s,A); s.last={}; scored(s,A,3,"field goal"); s.phase="kickoff"; s.kicker=A; afterPlay(s); });
T("A FG -> still OT:",(s,A,B)=>{ scored(s,A,3,"field goal"); s.phase="kickoff"; s.kicker=A; afterPlay(s); recv(s,B); });
T("A INT, B FG -> over:",(s,A,B)=>{ s.poss=B; afterPlay(s); scored(s,B,3,"field goal"); s.phase="kickoff"; s.kicker=B; afterPlay(s); });
`);
