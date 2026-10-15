const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};const errs=[];
const pg=await (await b.newContext({viewport:{width:1000,height:720}})).newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(400);
out.noGlobalToggle=await pg.evaluate(()=>!document.getElementById('hardMode'));
await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
// magnifier shows in normal mode once a piece is touched
await pg.evaluate(()=>{spreadOut()});await pg.waitForTimeout(200);
out.normal=await pg.evaluate(()=>({hard:P.hard,loupeBtnShown:!document.getElementById('loupeBtn').hidden,rotateHidden:document.getElementById('rotate').hidden,rots:P.pieces.filter(p=>p.rot).length}));
await pg.evaluate(()=>{P.lastId=P.pieces.find(p=>!p.inTray).g; draw();});await pg.waitForTimeout(100);
out.loupeNormal=await pg.evaluate(()=>({wrapShown:!document.getElementById('loupeWrap').hidden,empty:document.getElementById('loupeWrap').classList.contains('empty')}));
// touched puzzle: toggle must arm, then restart in hard mode
await pg.click('#hardBtn');await pg.waitForTimeout(100);
out.armed=await pg.evaluate(()=>({armed:document.getElementById('hardBtn').classList.contains('armed'),lbl:document.querySelector('#hardBtn .lbl').textContent,stillNormal:!P.hard}));
await pg.click('#hardBtn');await pg.waitForTimeout(2500);
out.hardAfterRestart=await pg.evaluate(()=>({hard:P.hard,rotated:P.pieces.filter(p=>p.rot).length,count:P.count,moves:P.moves,rotateShown:!document.getElementById('rotate').hidden,pressed:document.getElementById('hardBtn').getAttribute('aria-pressed')}));
// untouched puzzle: toggle flips in place with no restart
await pg.click('#hardBtn');await pg.waitForTimeout(200);
out.flipInPlace=await pg.evaluate(()=>({hard:P.hard,rotated:P.pieces.filter(p=>p.rot).length,armed:document.getElementById('hardBtn').classList.contains('armed')}));
await pg.click('#hardBtn');await pg.waitForTimeout(200);
// hard mode snap: drop a turned piece on its correct spot -> it straightens and locks
out.snapTurned=await pg.evaluate(()=>{ const i=P.pieces.findIndex(p=>p.inTray&&p.rot); const p=P.pieces[i]; p.inTray=false; P.tray=P.tray.filter(k=>k!==i); const before=p.rot;
  // place its centre within tolerance of the right centre, still rotated
  p.x=p.c*P.pw+P.s*0.1; p.y=p.r*P.ph-P.s*0.1; const ok=snap(p.g); const g=P.groups.get(p.g); return {rotBefore:before,rotAfter:p.rot,locked:g.locked,snapped:ok,exact:p.x===p.c*P.pw&&p.y===p.r*P.ph}; });
// far away rotated piece must not lock
out.noFalseSnap=await pg.evaluate(()=>{ const i=P.pieces.findIndex(p=>p.inTray&&p.rot); const p=P.pieces[i]; p.inTray=false; P.tray=P.tray.filter(k=>k!==i); p.x=p.c*P.pw+P.s*2; p.y=p.r*P.ph; const ok=snap(p.g); return {snapped:ok,locked:P.groups.get(p.g).locked,rot:p.rot}; });
await pg.evaluate(()=>save());await pg.click('#back');await pg.waitForTimeout(300);
out.card=await pg.$eval('.box:first-of-type .pm, .box:first-of-type .sub',e=>e.textContent).catch(()=>null);
out.cardHardMark=await pg.evaluate(()=>document.querySelector('.box:first-of-type').textContent.includes('↻'));
await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
out.reopen=await pg.evaluate(()=>({hard:P.hard,pressed:document.getElementById('hardBtn').getAttribute('aria-pressed'),locked:[...P.groups.values()].filter(g=>g.locked).length}));
// keyboard M toggles the magnifier in any mode
await pg.keyboard.press('m');await pg.waitForTimeout(100);out.mKey=await pg.evaluate(()=>document.getElementById('loupeBtn').getAttribute('aria-pressed'));await pg.keyboard.press('m');
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close()})();
