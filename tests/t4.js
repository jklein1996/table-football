const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2}); await c.addInitScript(()=>{try{localStorage.setItem('tb.manual','0')}catch(e){}}); const p=await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
  await p.goto('http://127.0.0.1:8080/'); await p.click('button[data-act=local]');
  await p.fill('#pname','Joe'); await p.click('button:has-text("Join Chiefs")'); await p.waitForTimeout(200);
  await p.selectOption('#qmin','5'); await p.waitForTimeout(200);
  await p.click('button:has-text("Start the game")'); await p.waitForTimeout(200);
  await p.click('.tabbar >> text=Field'); await p.click('text=Flip the coin'); await p.waitForTimeout(200);
  const seen={}; let shots=0;
  for(let i=0;i<400;i++){
    if(await p.locator('#crash').count()){ console.log('CRASH SCREEN', await p.locator('#crash').innerText()); break; }
    await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
    const turn=p.locator('.panel.turn:visible').first();
    if(!(await turn.count())){ const over=await p.locator('text=win!').count()+await p.locator("text=It's a tie").count(); if(over){console.log('GAME OVER');break;} console.log('stuck', (await p.locator('.wait').allInnerTexts()).join('/')); break; }
    const h=await turn.locator('h2').innerText();
    if(/call/i.test(h)&&!/try/.test(h)){ const pl=turn.locator('[data-act=pick]:not([disabled])'); const n=await pl.count(); await pl.nth(Math.floor(Math.random()*Math.min(n,9))).click(); await turn.locator('button.btn.primary').click(); }
    else { await turn.locator('button.btn.primary').first().click(); }
    await p.waitForTimeout(60);
    const ev=await p.evaluate(()=>window.__tb.S.last&&window.__tb.S.last.ev);
    if(ev&&!seen[ev]){ seen[ev]=1; if(['qt','td','flag','sack','int','fg','first'].includes(ev)){ await p.waitForTimeout(1300); await p.evaluate(()=>window.scrollTo(0,0)); await p.screenshot({path:`a_${ev}.png`}); } }
  }
  const st=await p.evaluate(()=>{const s=window.__tb.S; return {q:s.q,score:s.score,phase:s.phase,clock:s.clock};});
  console.log(JSON.stringify(st), Object.keys(seen).join(','));
  console.log('errors',errs.slice(0,10));
  await p.click('.tabbar >> text=Playbook'); await p.waitForTimeout(300); await p.screenshot({path:'b_off.png'});
  await p.click('button[data-act=pbsub][data-k=def]',{timeout:2000}).catch(()=>{}); await p.waitForTimeout(200); await p.screenshot({path:'b_def.png'});
  await p.click('button[data-act=pbsub][data-k=st]'); await p.waitForTimeout(200); await p.screenshot({path:'b_st.png'});
  await p.click('.tabbar >> text=Rules'); await p.waitForTimeout(200); await p.screenshot({path:'b_rules.png',fullPage:true});
  await b.close();
})();
