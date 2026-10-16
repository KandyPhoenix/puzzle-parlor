const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};const errs=[];
const pg=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(400);
await pg.evaluate(()=>{ window.__slug=IMAGES[0].slug; EGGS[window.__slug]={hot:{x:.2,y:.2,w:.1,h:.1,msg:'X marks the spot! You found the treasure.'},fin:'coins',glow:{x:.8,y:.7}}; renderGrid(); });
out.badge=await pg.$('.box:first-of-type .egg');
await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
const lockCells=(sel)=>pg.evaluate((sel)=>{ const {pw,ph,pieces}=P; let n=0; for(const p of pieces){ const inHot=(p.c*pw<.3*P.W&&p.c*pw+pw>.2*P.W&&p.r*ph<.3*P.H&&p.r*ph+ph>.2*P.H); if(sel==='hot'?!inHot:inHot) continue; if(P.groups.get(p.g).locked) continue; if(p.inTray){p.inTray=false;P.tray=P.tray.filter(k=>k!==pieces.indexOf(p));} p.x=p.c*pw; p.y=p.r*ph; snap(p.g); n++; } updateProgress(); draw(); return n; },sel);
out.lockedOthers=await lockCells('others');
out.beforeHot=await pg.evaluate(()=>({eh:!!P.eh,toast:!document.getElementById('eggToast').hidden,won:isWon()}));
out.lockedHot=await lockCells('hot');
await pg.waitForTimeout(300);
out.afterHot=await pg.evaluate(()=>({eh:!!P.eh,toast:!document.getElementById('eggToast').hidden,toastText:document.getElementById('eggToast').textContent,fx:!!P.eggFx,won:isWon()}));
await pg.screenshot({path:'egg_hot.png'});
// saved flag survives a reload of the puzzle
await pg.evaluate(()=>save()); out.savedEh=await pg.evaluate(()=>store.get(P.key).eh);
// finish: card is held back while the coins fall
await pg.evaluate(()=>celebrate()); await pg.waitForTimeout(1500);
out.finish1=await pg.evaluate(()=>({win:!document.getElementById('win').hidden,fx:!document.getElementById('confetti').hidden,won:P.won}));
await pg.screenshot({path:'egg_coins.png'});
await pg.waitForTimeout(2800);
out.finish2=await pg.evaluate(()=>({win:!document.getElementById('win').hidden,fx:!document.getElementById('confetti').hidden}));
await pg.click('#winStay'); await pg.waitForTimeout(200);
out.admire=await pg.evaluate(()=>({win:!document.getElementById('win').hidden,fxStillRunning:!document.getElementById('confetti').hidden}));
// the other two effects
await pg.evaluate(()=>{document.getElementById('confetti').hidden=true}); await pg.waitForTimeout(100);
await pg.evaluate(()=>eggFinish('snow',{})); await pg.waitForTimeout(2500); await pg.screenshot({path:'egg_snow.png'});
await pg.evaluate(()=>{document.getElementById('confetti').hidden=true}); await pg.waitForTimeout(100);
await pg.evaluate(()=>eggFinish('fireworks',{})); await pg.waitForTimeout(3200); await pg.screenshot({path:'egg_fireworks.png'});
out.fwParts=await pg.evaluate(()=>!document.getElementById('confetti').hidden);
// leaving stops the layer and the toast
await pg.click('#back'); await pg.waitForTimeout(200);
out.left=await pg.evaluate(()=>({fx:document.getElementById('confetti').hidden,toast:document.getElementById('eggToast').hidden}));
// locked (unpaid) player: no surprise, plain finish
await pg.evaluate(()=>{ LOCKING=true; lic.set(null); });
out.unpaidActive=await pg.evaluate(()=>{ P={img:IMAGES[0]}; const r=eggActive(); P=null; return r; });
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close()})();
