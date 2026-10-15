const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:1100,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(400);await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>{ spreadOut(); const ps=P.pieces; const k=Math.floor(ps.length*0.3); const out={count:ps.length};
  // join 20 loose pieces into one group WITHOUT locking: must not count as done
  const loose=ps.map((p,i)=>i).slice(0,20); const g0=P.groups.get(ps[loose[0]].g); for(const i of loose.slice(1)){ const g=P.groups.get(ps[i].g); merge(g0,g); P.groups.delete(g.id); }
  out.pctJoinedOnly=pct();
  // lock k pieces in place
  for(const i of ps.map((p,i)=>i).slice(20,20+k)){ const p=ps[i]; p.x=p.c*P.pw; p.y=p.r*P.ph; p.rot=0; p.inTray=false; P.groups.get(p.g).locked=true; }
  out.locked=k; out.pctLocked=pct(); updateProgress(); save(); out.header=document.querySelector('#pProg em').textContent; out.idx=idx()[P.key].pct; return out; });
await pg.click('#back');await pg.waitForTimeout(300);
const card=await pg.$eval('.box:first-of-type .size .s',e=>e.textContent);
await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);
await pg.click('#restart');await pg.click('#restart');await pg.waitForTimeout(2800);
const afterRestart=await pg.evaluate(()=>({pct:pct(),idx:idx()[P.key]&&idx()[P.key].pct,header:document.querySelector('#pProg em').textContent}));
await pg.click('#back');await pg.waitForTimeout(300);
const card2=await pg.$eval('.box:first-of-type .size .s',e=>e.textContent);
console.log(JSON.stringify({r,cardBefore:card,afterRestart,cardAfter:card2,errs}));await b.close()})();
