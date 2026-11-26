const {chromium}=require('playwright');
const W=+process.argv[2]||375, H=+process.argv[3]||667;
(async()=>{ const b=await chromium.launch();
 const mk=async()=>{ const c=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'}); await c.addInitScript(()=>{window.TB_RELAY='ws://127.0.0.1:8787';}); const p=await c.newPage(); p.on('pageerror',e=>console.log('PAGEERR',e.message)); return p; };
 const issues=[];
 const check=async(p,name)=>{ await p.waitForTimeout(250);
  const r=await p.evaluate(()=>{ const out=[]; const vw=innerWidth;
   const clipped=el=>{ for(let a=el.parentElement;a;a=a.parentElement){ const cs=getComputedStyle(a); if(/(auto|scroll|hidden)/.test(cs.overflowX)) return true; } return false; };
   document.querySelectorAll('body *').forEach(el=>{ const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||cs.position==='fixed') return; const rc=el.getBoundingClientRect(); if(!rc.width) return;
     if((rc.right>vw+1||rc.left<-1)&&!clipped(el)) out.push(el.tagName+'.'+el.className+' "'+(el.innerText||'').slice(0,30).replace(/\n/g,' ')+'" '+Math.round(rc.left)+'..'+Math.round(rc.right));
     if((el.tagName==='BUTTON'||el.classList.contains('btn'))&&(el.scrollWidth>el.clientWidth+2)) out.push('TEXT-CUT '+el.tagName+'.'+el.className+' "'+(el.innerText||'').slice(0,30).replace(/\n/g,' ')+'" sw'+el.scrollWidth+' cw'+el.clientWidth); });
   return {sw:document.documentElement.scrollWidth,vw,out:out.slice(0,12)}; });
  if(r.sw>r.vw||r.out.length) issues.push(name+' sw='+r.sw+' '+JSON.stringify(r.out));
  await p.screenshot({path:`sweep/${W}-${name}.png`,fullPage:true}); };
 const host=await mk(), amy=await mk();
 await host.goto('http://127.0.0.1:8080/'); await check(host,'home');
 await host.click('button[data-act=host]'); await host.waitForSelector('.sync.on',{timeout:15000});
 const code=(await host.evaluate(()=>location.hash)).slice(1);
 await host.fill('#pname','Joe'); await host.click('button:has-text("Join Chiefs")'); await check(host,'lobby-admin');
 await host.click('button[data-act=qrbig]').catch(()=>{}); await host.waitForTimeout(200); await check(host,'qrbig'); await host.keyboard.press('Escape');
 await amy.goto('http://127.0.0.1:8080/#'+code); await amy.click('text=Join as a player'); await amy.waitForSelector('#pname',{timeout:15000});
 await amy.fill('#pname','Amy'); await amy.click('button:has-text("Join Eagles")'); await amy.waitForTimeout(500); await check(amy,'lobby-player');
 await host.click('.tabbar >> text=Admin'); await check(host,'admin');
 await host.click('.tabbar >> text=Teams'); await host.click('button:has-text("Start the game")'); await check(host,'toss');
 await host.click('text=Flip the coin'); await host.waitForTimeout(400);
 const seen={};
 for(let i=0;i<160;i++){ for(const p of [host,amy]){ const t=p.locator('.panel.turn:visible').first(); if(!(await t.count())) continue; const h=await t.locator('h2').innerText(); const nm=p===host?'joe':'amy';
   const key=h.replace(/Your (call|roll): (Chiefs|Eagles) /,'').replace(/\s+/g,'-').slice(0,30);
   if(!seen[key]){ seen[key]=1; await check(p,nm+'-'+key); }
   if(/call/i.test(h)&&!/try/.test(h)){ const pl=t.locator(/defense/.test(h)?'button.play':'button.colpick'); const n=await pl.count(); await pl.nth(i%n).click(); await t.locator('button.btn.primary').click(); }
   else if(/try/.test(h)) await t.locator('button.btn.primary').click();
   else { await t.locator('button[data-act=dicemode][data-k="0"]').click(); await t.locator('button.btn.primary').first().click(); }
   await p.waitForTimeout(80); } }
 await check(host,'field-after');
 await host.click('.tabbar >> text=Playbook'); for(const k of ['run','pass','qt','st']){ const bt=host.locator(`button[data-act=pbcat][data-k=${k}]`); if(await bt.count()){ await bt.click(); await check(host,'pb-'+k);} }
 for(const k of ['def','st','how']){ const bt=host.locator(`button[data-act=pbsub][data-k=${k}]`); if(await bt.count()){ await bt.click(); await check(host,'pbsub-'+k);} }
 await amy.click('.tabbar >> text=Playbook'); await check(amy,'amy-playbook');
 await host.click('.tabbar >> text=Teams'); await check(host,'teams');
 await host.click('.tabbar >> text=Rules'); await check(host,'rules');
 await host.click('button:has-text("Leave game")'); await check(host,'confirm-leave'); await host.click('text=No, go back');
 await host.click('.tabbar >> text=TV'); await check(host,'tv-phone');
 const card=await mk(); await card.goto('http://127.0.0.1:8080/card.html#'+code); await check(card,'card');
 const tvp=await mk(); await tvp.goto('http://127.0.0.1:8080/#'+code); await tvp.click('text=Join as TV'); await tvp.waitForTimeout(2000); await check(tvp,'tv-join');
 console.log(Object.keys(seen).join(' | ')); console.log(issues.join('\n')||'NO ISSUES'); await b.close(); })();
