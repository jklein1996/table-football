const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:1}); await c.addInitScript(()=>{try{localStorage.setItem('tb.manual','0')}catch(e){}}); const p=await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8080/'); await p.click('button[data-act=local]');
  await p.fill('#pname','Joe'); await p.click('button:has-text("Join Chiefs")'); await p.waitForTimeout(200);
  await p.selectOption('select[data-dice="0"]','red'); await p.waitForTimeout(100);
  await p.selectOption('select[data-dice="1"]','green'); await p.waitForTimeout(100);
  await p.selectOption('select[data-dice="2"]','yellow'); await p.waitForTimeout(100);
  await p.selectOption('#dicedef','01'); await p.waitForTimeout(100);
  const sh=async n=>{ await p.addStyleTag({content:'.tabbar{position:static!important} .fx{display:none!important}'}); await p.screenshot({path:`gp/${n}.png`,fullPage:true}); };
  await p.locator('text=Your dice').scrollIntoViewIfNeeded(); await p.screenshot({path:'gp/dicebox.png'});
  await p.click('button:has-text("Start the game")'); await p.waitForTimeout(200);
  await p.click('.tabbar >> text=Field'); await p.click('text=Flip the coin'); await p.waitForTimeout(200);
  let t=p.locator('.panel.turn:visible').first(); await t.locator('button[data-act=dicemode][data-k="1"]').click(); await p.waitForTimeout(100); await sh('manual');
  await t.locator('button[data-act=dicemode][data-k="0"]').click(); await t.locator('button.btn.primary').first().click(); await p.waitForTimeout(200);
  for(let i=0;i<5;i++){ t=p.locator('.panel.turn:visible').first(); const h=await t.locator('h2').innerText(); if(/offense$/.test(h)&&/call/.test(h)) break; await t.locator('button.btn.primary').first().click(); await p.waitForTimeout(150); }
  t=p.locator('.panel.turn:visible').first(); await t.locator('button.colpick').nth(2).click(); await p.waitForTimeout(100); await sh('callsel');
  await p.click('.tabbar >> text=Playbook'); await p.waitForTimeout(200); await sh('pboff');
  await p.click('button[data-act=pbcat][data-k=pass]'); await p.waitForTimeout(100); await sh('pbpass'); await p.click('button[data-act=pbcat][data-k=st]'); await p.waitForTimeout(100); await sh('pbst'); await p.click('button[data-act=pbzoom][data-k="-1"]'); await p.click('button[data-act=pbzoom][data-k="-1"]'); await sh('pbstz');
  await p.click('button[data-act=pbsub][data-k=def]'); await p.waitForTimeout(100); await sh('pbdef');
  await p.click('.tabbar >> text=Rules'); await p.waitForTimeout(100); await sh('rules');
  console.log('errs',errs); await b.close(); })();
