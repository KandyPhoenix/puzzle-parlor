const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};const errs=[];
const ctx=await b.newContext({viewport:{width:1100,height:800}});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push('err:'+e.message));pg.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,120))});
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(500);
// 1. open 96-piece, take a piece from the tray by clicking its thumbnail, check it lands on table
await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
out.trayCount0=await pg.$eval('#trayCount',e=>e.textContent);
await pg.click('#trayStrip .tp');await pg.waitForTimeout(300);
out.afterTakeOne=await pg.evaluate(()=>({tray:P.pieces.filter(p=>p.inTray).length,onTable:P.pieces.filter(p=>!p.inTray).length}));
// 2. drag that piece to its home: should snap+lock
const r1=await pg.evaluate(()=>{const p=P.pieces.find(q=>!q.inTray);const r=cv.getBoundingClientRect();return {i:P.pieces.indexOf(p),x:r.left+(p.x+P.pw/2-cam.x)*cam.z,y:r.top+(p.y+P.ph/2-cam.y)*cam.z,hx:r.left+(p.c*P.pw+P.pw/2-cam.x)*cam.z,hy:r.top+(p.r*P.ph+P.ph/2-cam.y)*cam.z}});
await pg.mouse.move(r1.x,r1.y);await pg.mouse.down();await pg.mouse.move(r1.hx+3,r1.hy-2,{steps:12});await pg.mouse.up();await pg.waitForTimeout(300);
out.snapLocked=await pg.evaluate((i)=>P.groups.get(P.pieces[i].g).locked,r1.i);
out.pctAfterOne=await pg.evaluate(()=>pct());
// 3. reload mid-puzzle: progress, elapsed and locked piece restored
await pg.waitForTimeout(1500);await pg.evaluate(()=>{tick();save()});const elBefore=await pg.evaluate(()=>P.elapsed);
await pg.reload();await pg.waitForTimeout(500);await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
out.resume=await pg.evaluate((i)=>({locked:P.groups.get(P.pieces[i].g).locked,elapsedKept:P.elapsed>1000,tray:P.pieces.filter(p=>p.inTray).length}),r1.i);
out.elapsedBeforeReload=Math.round(elBefore);
// 4. solve everything programmatically through real snapping: move each piece to home via moveGroup+snap
const win=await pg.evaluate(()=>{ for(const p of P.pieces){ if(p.inTray){ p.inTray=false; } } P.tray=[]; for(const p of P.pieces){ const g=P.groups.get(p.g); if(g.locked) continue; moveGroup(g,p.c*P.pw-p.x,p.r*P.ph-p.y); snap(p.g); } const wonBeforeCelebrate=isWon(); if(wonBeforeCelebrate&&!P.won) celebrate(); return {won:wonBeforeCelebrate,pct:pct(),groups:P.groups.size,done:!!P.won}; });
await pg.waitForTimeout(600); out.win=win; out.winOverlay=await pg.evaluate(()=>!document.getElementById('win').hidden);
console.log('partial',JSON.stringify(out)); await pg.click('#winBack');await pg.waitForTimeout(300); out.cardDone=await pg.$eval('.box:first-of-type .size .s',e=>e.textContent);
// 5. sync: set a code with mocked API, check PUT of index happens
const puts=[];await pg.route('**/api/p/**',async route=>{const req=route.request();puts.push(req.method()+' '+req.url().split('/api/p/')[1]);if(req.method()==='GET')return route.fulfill({status:404,body:'Not found'});return route.fulfill({status:204,body:''})});
await pg.click('#syncBtn');await pg.fill('#syncInput','test-code-99');await pg.click('#syncSave');await pg.waitForTimeout(800);
out.sync={label:await pg.$eval('#syncLbl',e=>e.textContent),calls:puts.slice(0,6)};
console.log('partial2',JSON.stringify({cardDone:out.cardDone,sync:out.sync}));
// 6. phone layout: tray + toolbar fit, pause and unlock button visible
const ph=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const pp=await ph.newPage();pp.on('pageerror',e=>errs.push('phone:'+e.message));
await pp.goto('http://127.0.0.1:8768/?lock=1');await pp.waitForTimeout(600);
out.phone={lockChips:await pp.$$eval('.box .lock',e=>e.length),overflowX:await pp.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)};
await pp.click('.box:first-of-type .size');await pp.waitForTimeout(2500);
out.phone.toolsVisible=await pp.evaluate(()=>{const t=document.querySelector('#play .tools')||document.getElementById('restart').parentElement;const r=t.getBoundingClientRect();return r.bottom<=window.innerHeight+1});
out.phone.pauseWorks=await pp.evaluate(async()=>{document.getElementById('pauseBtn').click();await new Promise(r=>setTimeout(r,50));return !document.getElementById('paused').hidden});
out.errs=errs; console.log(JSON.stringify(out,null,1)); await b.close(); })();
