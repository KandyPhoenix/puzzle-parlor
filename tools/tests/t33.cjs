const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};const errs=[];
const ctx=await b.newContext({viewport:{width:900,height:700},hasTouch:true});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(400);
// A: re-entrancy: open a 1000-piece puzzle, go back during cutting, open a 96-piece one
await pg.click('.box:first-of-type .size:nth-of-type(8)');await pg.waitForTimeout(150);await pg.click('#back');await pg.waitForTimeout(100);await pg.click('.box:nth-of-type(2) .size:nth-of-type(1)');await pg.waitForTimeout(6000);await pg.click('#hardBtn');await pg.waitForTimeout(200);
out.reentry=await pg.evaluate(()=>({img:P.img.slug,n:P.n,count:P.count,galleryHidden:document.getElementById('gallery').hidden}));
// B: rotate a piece that is in the tray must do nothing
const r=await pg.evaluate(()=>{ const i=P.pieces.findIndex(p=>p.inTray); P.lastId=P.pieces[i].g; const rot=P.pieces[i].rot; const groups=P.groups.size; rotateGroup(P.lastId); return {i,rotBefore:rot,rotAfter:P.pieces[i].rot,inTray:P.pieces[i].inTray,groupsSame:P.groups.size===groups}; });
out.trayRotateBlocked=r;
// C: touch double-tap rotates in hard mode (first tap must not leave the piece lifted)
await pg.evaluate(()=>{spreadOut()});await pg.waitForTimeout(200);
const pt=await pg.evaluate(()=>{const p=P.pieces.find(q=>!q.inTray);const rc=cv.getBoundingClientRect();return {x:rc.left+(p.x+P.pw/2-cam.x)*cam.z,y:rc.top+(p.y+P.ph/2-cam.y)*cam.z,rot:p.rot,i:P.pieces.indexOf(p),moves:P.moves}});
await pg.touchscreen.tap(pt.x,pt.y);await pg.waitForTimeout(120);const mid=await pg.evaluate((i)=>({rot:P.pieces[i].rot,moves:P.moves}),pt.i);await pg.touchscreen.tap(pt.x,pt.y);await pg.waitForTimeout(200);
out.touchDoubleTap=await pg.evaluate((a)=>({rotBefore:a.rot,rotAfterFirstTap:null,rotAfter:P.pieces[a.i].rot,movesBefore:a.moves,moves:P.moves}),pt); out.touchDoubleTap.rotAfterFirstTap=mid.rot; out.touchDoubleTap.movesAfterFirstTap=mid.moves;
// D: paused blocks tray and keyboard
await pg.click('#pauseBtn');await pg.waitForTimeout(100);await pg.keyboard.press('r');const rp=await pg.evaluate((i)=>P.pieces[i].rot,pt.i);const canvasBlocked=await pg.evaluate(()=>{const el=document.elementFromPoint(window.innerWidth/2,window.innerHeight-40);return el&&!!el.closest('#paused')});
out.pause={rotateIgnored:rp===out.touchDoubleTap.rotAfter,overlayCoversToolbar:canvasBlocked};await pg.keyboard.press(' ');await pg.waitForTimeout(100);out.pause.resumedBySpace=await pg.evaluate(()=>!P.paused);
// E: restart keeps best after a win
await pg.evaluate(()=>{ for(const p of P.pieces){p.inTray=false} P.tray=[]; for(const p of P.pieces){const g=P.groups.get(p.g); if(g.locked) continue; moveGroup(g,p.c*P.pw-p.x,p.r*P.ph-p.y); p.rot=0; snap(p.g);} if(isWon()&&!P.won) celebrate(); });
await pg.waitForTimeout(500);await pg.click('#winStay');await pg.waitForTimeout(100);
const best=await pg.evaluate(()=>idx()[P.key].best);
// a finished puzzle: restart twice (armed) and check best survives
await pg.click('#back');await pg.waitForTimeout(300);await pg.click('.box:nth-of-type(2) .size:nth-of-type(1)');await pg.waitForTimeout(2500);
await pg.click('#restart');await pg.click('#restart');await pg.waitForTimeout(2800);
out.restartKeepsBest=await pg.evaluate((best)=>({bestBefore:best,bestAfter:idx()[P.key].best,done:idx()[P.key].done,pct:idx()[P.key].pct}),best);
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close()})();
