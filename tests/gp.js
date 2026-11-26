const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1}); const p=await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8080/'); await p.click('button[data-act=local]');
  await p.fill('#pname','Joe'); await p.click('button:has-text("Join Chiefs")'); await p.waitForTimeout(200);
  await p.click('button:has-text("Start the game")'); await p.waitForTimeout(200);
  await p.click('.tabbar >> text=Field'); await p.click('text=Flip the coin'); await p.waitForTimeout(200);
  const shot=async n=>{ await p.addStyleTag({content:'.tabbar{position:static!important} .fx{display:none!important}'}); await p.screenshot({path:`gp/${n}.png`,fullPage:true}); };
  const got={}; 
  for(let i=0;i<300;i++){
    const turn=p.locator('.panel.turn:visible').first(); if(!(await turn.count())) break;
    const h=await turn.locator('h2').innerText();
    if(/kickoff/.test(h)&&!got.ko){got.ko=1; await shot('ko');}
    if(/Your roll: .* (kick|punt|blocked|fumble|interception|quarterback)/i.test(h)&&!got['f'+h]){ got['f'+h]=1; if(Object.keys(got).length<9) await shot('fol'+i); }
    if(/offense$/.test(h)&&/Your call/.test(h)){ if(!got.oc){got.oc=1; await turn.locator('button[data-act=obd][data-k=out]').click(); await shot('offcall');}
      const pl=turn.locator('button.play:not([disabled])'); const n=await pl.count(); const k=i%7===3?n-3:Math.floor(Math.random()*Math.min(n,11)); await pl.nth(k).click();
      if(await turn.locator('button[data-act=coffin]').count() && !got.cof){ got.cof=1; await turn.locator('button[data-act=coffin][data-k="1"]').click(); }
      await turn.locator('button.btn.primary').click(); }
    else if(/defense$/.test(h)&&/Your call/.test(h)){ if(!got.dc){got.dc=1; await shot('defcall');} await turn.locator('button.play').nth(i%6).click(); await turn.locator('button.btn.primary').click(); }
    else { if(/offense$/.test(h)&&!got.roll){ got.roll=1; await shot('rollpreview'); }
      await turn.locator('button.btn.primary').first().click(); }
    await p.waitForTimeout(60);
  }
  console.log(Object.keys(got)); console.log('errors',errs);
  await p.click('.tabbar >> text=Field'); await p.click('button[data-act=lookup]').catch(()=>{}); await p.waitForTimeout(300); await shot('lookup');
  await b.close();
})();
