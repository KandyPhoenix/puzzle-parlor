const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:1000,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(500);await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
await pg.waitForTimeout(2100); const t1=await pg.evaluate(()=>P.elapsed);
await pg.click('#pauseBtn'); await pg.waitForTimeout(2200); const t2=await pg.evaluate(()=>P.elapsed); const shown=await pg.$eval('#paused',e=>!e.hidden); const lbl=await pg.$eval('#pauseBtn',e=>e.getAttribute('aria-label'));
await pg.click('#resumeBtn'); await pg.waitForTimeout(2200); const t3=await pg.evaluate(()=>P.elapsed); const hidden=await pg.$eval('#paused',e=>e.hidden);
await pg.click('#back'); await pg.waitForTimeout(300); const saved=await pg.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('jig:'));return JSON.parse(localStorage.getItem(k)).el||JSON.parse(localStorage.getItem(k)).elapsed});
console.log(JSON.stringify({t1:Math.round(t1),pausedDelta:Math.round(t2-t1),resumedDelta:Math.round(t3-t2),shown,lbl,hidden,savedElapsed:saved,errs}));await b.close()})();
