const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:1100,height:800}});
  const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  const calls=[];
  await pg.route('**/api/license/**',async route=>{const req=route.request();const body=JSON.parse(req.postData()||'{}');calls.push([req.url().split('/api/license/')[1],body.code]);
    if(req.url().endsWith('activate')){ if(/good/i.test(body.code)) return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,code:'PP-GOOD-GOOD-GOOD',devices:1,max:5})});
      return route.fulfill({status:404,contentType:'application/json',body:JSON.stringify({ok:false,error:'unknown',message:'That code is not recognised. Check it for typos.'})}); }
    return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}); });
  const out={};
  // 1. no lock param: nothing locked
  await pg.goto('http://127.0.0.1:8768/'); await pg.waitForTimeout(500);
  out.unlockedBtnHidden=await pg.$eval('#unlockBtn',e=>e.hidden); out.lockChips=await pg.$$eval('.box .lock',e=>e.length);
  // 2. lock=1
  await pg.goto('http://127.0.0.1:8768/?lock=1'); await pg.waitForTimeout(500);
  out.btn=await pg.$eval('#unlockBtn span',e=>e.textContent); out.free=await pg.$$eval('.box .free',e=>e.length); out.locked=await pg.$$eval('.box .lock',e=>e.length);
  out.lockedSizes=await pg.$$eval('.size.locked',e=>e.length);
  // click a locked size → dialog
  await pg.click('.size.locked'); await pg.waitForTimeout(200);
  out.dialogShown=await pg.$eval('#unlock',e=>!e.hidden); out.title=await pg.$eval('#unlockTitle',e=>e.textContent); out.playHidden=await pg.$eval('#play',e=>e.hidden);
  // bad code
  await pg.fill('#unlockInput','pp-bad1-bad1-bad1'); await pg.click('#unlockGo'); await pg.waitForTimeout(300);
  out.badMsg=await pg.$eval('#unlockMsg',e=>e.textContent);
  // good code
  await pg.fill('#unlockInput','pp good good good'); await pg.click('#unlockGo'); await pg.waitForTimeout(300);
  out.goodMsg=await pg.$eval('#unlockMsg',e=>e.textContent);
  await pg.waitForTimeout(1600);
  out.dialogClosed=await pg.$eval('#unlock',e=>e.hidden); out.btnAfter=await pg.$eval('#unlockBtn span',e=>e.textContent);
  out.lockedAfter=await pg.$$eval('.box .lock',e=>e.length); out.licStored=await pg.evaluate(()=>JSON.parse(localStorage.getItem('jig-lic')).code);
  // reload keeps unlock; a previously locked puzzle opens
  await pg.reload(); await pg.waitForTimeout(500);
  out.afterReloadLocked=await pg.$$eval('.box .lock',e=>e.length);
  await pg.click('.box:nth-of-type(3) .size'); await pg.waitForTimeout(2500); out.opened=await pg.evaluate(()=>!document.getElementById('play').hidden&&P.pieces.length>0);
  await pg.click('#back'); await pg.waitForTimeout(300);
  // remove device
  await pg.click('#unlockBtn'); await pg.waitForTimeout(200); out.doneShown=await pg.$eval('#unlockDone',e=>!e.hidden);
  await pg.click('#unlockRemove'); await pg.waitForTimeout(300); out.relocked=await pg.$$eval('.box .lock',e=>e.length);
  out.calls=calls; out.errs=errs;
  console.log(JSON.stringify(out,null,1)); await b.close();
})();
