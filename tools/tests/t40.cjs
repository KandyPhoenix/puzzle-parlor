const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};const errs=[];
const pg=await (await b.newContext({viewport:{width:1100,height:760}})).newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(400);
for(const slug of ['monster-ball','witch-kitchen','haunted-village']){
  const r={};
  await pg.evaluate(s=>openPuzzle(IMAGES.find(i=>i.slug===s),100),slug); await pg.waitForTimeout(3000);
  r.badge=await pg.evaluate(()=>!!EGGS[P.img.slug]);
  const lock=(sel)=>pg.evaluate((sel)=>{ const e=EGGS[P.img.slug].hot, {pw,ph,pieces}=P, x0=e.x*P.W,y0=e.y*P.H,x1=x0+e.w*P.W,y1=y0+e.h*P.H; let n=0;
    for(const p of pieces){ const px=p.c*pw,py=p.r*ph, inHot=px<x1&&px+pw>x0&&py<y1&&py+ph>y0; if(sel==='hot'?!inHot:inHot) continue; if(P.groups.get(p.g).locked) continue; if(p.inTray){p.inTray=false;P.tray=P.tray.filter(k=>k!==pieces.indexOf(p));} p.x=p.c*pw; p.y=p.r*ph; snap(p.g); n++; } updateProgress(); draw(); return n; },sel);
  r.others=await lock('others'); r.ehBefore=await pg.evaluate(()=>!!P.eh);
  r.hot=await lock('hot'); await pg.waitForTimeout(250);
  r.after=await pg.evaluate(()=>({eh:!!P.eh,toast:document.getElementById('eggToast').textContent,col:P.eggFx&&P.eggFx.col}));
  await pg.evaluate(()=>celebrate()); await pg.waitForTimeout(2300); await pg.screenshot({path:'egg_'+slug+'.png'});
  r.running=await pg.evaluate(()=>({fx:!document.getElementById('confetti').hidden,win:!document.getElementById('win').hidden,band:!!eggBand}));
  await pg.waitForTimeout(2000); r.winLater=await pg.evaluate(()=>!document.getElementById('win').hidden);
  await pg.evaluate(()=>{document.getElementById('confetti').hidden=true}); await pg.waitForTimeout(400);
  r.afterStop=await pg.evaluate(()=>({zOk:Math.abs(cam.z-fitZ())/fitZ()<.002,band:!!eggBand}));
  await pg.evaluate(()=>leave()); await pg.waitForTimeout(300);
  out[slug]=r;
}
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close()})();
