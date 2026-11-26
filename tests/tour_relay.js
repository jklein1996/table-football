const {chromium}=require('playwright');
const OUT='tourr/'; let n=0; const names=[];
(async()=>{
  const b=await chromium.launch();
  const mk=async(w=390,h=844)=>{ const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2}); await c.addInitScript(()=>{window.TB_RELAY='ws://127.0.0.1:8787';}); await c.addInitScript(()=>{try{localStorage.setItem('tb.manual','0')}catch(e){}}); const p=await c.newPage(); p.on('pageerror',e=>console.log('PAGEERR',e.message)); return p; };
  const shot=async(p,label,full)=>{ n++; await p.addStyleTag({content:'.tabbar{position:static!important} body{padding-bottom:0!important} .fx{display:none}'}).catch(()=>{}); const f=`${String(n).padStart(2,'0')}-${label}.png`; await p.waitForTimeout(250); await p.screenshot({path:OUT+f,fullPage:!!full}); names.push(f); };
  const host=await mk(), amy=await mk();
  await host.goto('http://127.0.0.1:8080/'); await shot(host,'home',true);
  await host.click('button[data-act=host]'); await host.waitForSelector('.sync.on',{timeout:10000});
  const code=(await host.evaluate(()=>location.hash)).slice(1);
  await host.fill('#pname','Joe'); await host.click('button:has-text("Join Chiefs")'); await host.waitForTimeout(300);
  await amy.goto('http://127.0.0.1:8080/#'+code); await amy.click('text=Join as a player'); await amy.waitForSelector('#pname',{timeout:15000}); await amy.waitForTimeout(500);
  await amy.fill('#pname','Amy'); await amy.click('button:has-text("Join Eagles")'); await amy.waitForTimeout(600);
  await shot(host,'lobby-admin',true); await shot(amy,'lobby-player',true);
  await host.click('.tabbar >> text=Admin'); await shot(host,'admin',true);
  await host.click('.tabbar >> text=Teams'); await host.click('button:has-text("Start the game")'); await host.waitForTimeout(300);
  await shot(host,'coin-toss');
  await host.click('text=Flip the coin'); await host.waitForTimeout(500);
  const got={}; const want=['kick-roll','off-call','def-call','roll','result','qt-roll','anim-first','anim-td'];
  for(let i=0;i<500 && want.some(w=>!got[w]);i++){
    for(const p of [host,amy]){
      const turn=p.locator('.panel.turn:visible').first(); if(!(await turn.count())) continue;
      const h=await turn.locator('h2').innerText();
      if(/kickoff/.test(h)&&!got['kick-roll']){ got['kick-roll']=1; await p.evaluate(()=>window.scrollTo(0,0)); await shot(p,'field-kickoff-roll',true); }
      if(/Your call: .* offense/.test(h)){ const pl=turn.locator('[data-act=pick]:not([disabled])'); const k=await pl.count(); await pl.nth(Math.floor(Math.random()*Math.min(k,9))).click(); if(!got['off-call']){ got['off-call']=1; await shot(p,'field-offense-call',true);} await turn.locator('button.btn.primary').click(); }
      else if(/Your call: .* defense/.test(h)){ const pl=turn.locator('button.play'); await pl.nth(Math.floor(Math.random()*6)).click(); if(!got['def-call']){ got['def-call']=1; await shot(p,'field-defense-call',true);} await turn.locator('button.btn.primary').click(); }
      else if(/Your call: the try/.test(h)){ await turn.locator('button.btn.primary').click(); }
      else if(/Your roll/.test(h)){
        if(/quarterback trapped/.test(h)&&!got['qt-roll']){ got['qt-roll']=1; await p.evaluate(()=>window.scrollTo(0,0)); await shot(p,'field-qt-followup-roll',true); }
        if(/offense$/.test(h)&&!got['roll']){ got['roll']=1; await shot(p,'field-roll'); await p.click('button[data-act=dicemode][data-k="1"]'); await shot(p,'field-roll-real-dice',true); await p.click('button[data-act=dicemode][data-k="0"]'); }
        await turn.locator('button.btn.primary').first().click(); }
      await p.waitForTimeout(120);
      const l=await p.evaluate(()=>window.__tb.S&&window.__tb.S.last);
      if(l&&l.o&&l.d&&!l.wait&&!got['result']){ got['result']=1; await p.waitForTimeout(2600); await p.evaluate(()=>window.scrollTo(0,0)); await shot(p,'field-result-lookup',true); }
      if(l&&l.ev==='first'&&!got['anim-first']){ got['anim-first']=1; await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(900); await p.addStyleTag({content:'.fx{display:block!important}'}); await p.screenshot({path:OUT+'12-anim-first-down.png'}); n++; names.push('12'); }
      if(l&&l.ev==='td'&&!got['anim-td']){ got['anim-td']=1; await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(900); await p.addStyleTag({content:'.fx{display:block!important}'}); await p.screenshot({path:OUT+'13-anim-touchdown.png'}); n++; names.push('13'); }
    }
  }
  console.log('missing',want.filter(w=>!got[w]));
  await host.click('.tabbar >> text=Playbook'); await shot(host,'playbook-offense');
  await host.click('button[data-act=pbsub][data-k=def]'); await shot(host,'playbook-defense');
  await host.click('button[data-act=pbsub][data-k=st]'); await shot(host,'playbook-kicks');
  await host.click('button[data-act=pbsub][data-k=how]'); await shot(host,'playbook-how-to-read',true);
  await host.click('.tabbar >> text=Teams'); await shot(host,'teams-in-game',true);
  await host.click('.tabbar >> text=Rules'); await shot(host,'rules',true);
  await host.click('.tabbar >> text=Admin'); await host.click('button:has-text("Pause game")'); await shot(host,'confirm-pause');
  await host.click('button:has-text("No, go back")');
  const tv=await mk(1280,720); await tv.goto('http://127.0.0.1:8080/#'+code); await tv.click('text=Join as TV'); await tv.waitForTimeout(2500); await shot(tv,'tv-cast-view');
  const card=await mk(); await card.goto('http://127.0.0.1:8080/card.html#'+code); await card.waitForTimeout(400); await shot(card,'quick-card',true);
  console.log(names.join('\n'));
  await b.close();
})();
