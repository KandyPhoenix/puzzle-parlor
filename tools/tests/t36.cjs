const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};const errs=[];
const ctx=await b.newContext({viewport:{width:1100,height:760}});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/?lock=1');await pg.waitForTimeout(500);
// free version: category shows the locked card, no add button
await pg.evaluate(()=>{cat='photos';store.set('jig-cat',cat);renderTabs();renderGrid()});await pg.waitForTimeout(100);
out.lockedCard=await pg.evaluate(()=>({unlockBtn:!!document.getElementById('photoUnlock'),addBtn:!!document.getElementById('addPhoto'),tab:document.getElementById('themeName').textContent}));
await pg.click('#photoUnlock');await pg.waitForTimeout(100);out.unlockOpened=await pg.evaluate(()=>({shown:!document.getElementById('unlock').hidden,title:document.getElementById('unlockTitle').textContent}));
// unlock, then add a photo
await pg.evaluate(()=>localStorage.setItem('jig-lic',JSON.stringify({code:'PP-TEST-CODE-0001',ok:true})));await pg.reload();await pg.waitForTimeout(500);
await pg.click('#addPhoto');await pg.waitForTimeout(100);
await pg.setInputFiles('#photoFile','photo-small.jpg');await pg.waitForTimeout(200);await pg.click('#photoAdd');await pg.waitForTimeout(500);
out.tooSmall=await pg.$eval('#photoMsg',e=>e.textContent);
await pg.setInputFiles('#photoFile','photo-test.jpg');await pg.waitForTimeout(300);
out.nameGuess=await pg.$eval('#photoName',e=>e.value); await pg.fill('#photoName','Our trip to Yellowstone');
await pg.click('#photoAdd');await pg.waitForTimeout(1500);
out.added=await pg.evaluate(()=>({dlgHidden:document.getElementById('photoDlg').hidden,photos:PHOTOS.length,w:PHOTOS[0].w,h:PHOTOS[0].h,title:PHOTOS[0].title,cards:document.querySelectorAll('.box[data-slug^="photo-"]').length,chip:document.querySelector('.box[data-slug^="photo-"] .chips').textContent,removeBtn:!!document.querySelector('.rmphoto')}));
// play it
await pg.click('.box[data-slug^="photo-"] .size');await pg.waitForTimeout(2500);
out.playing=await pg.evaluate(()=>({slug:P.img.slug,count:P.count,key:P.key,title:document.getElementById('pTitle').textContent,sub:document.getElementById('pSub').textContent,peek:document.getElementById('peekImg').src.slice(0,5)}));
await pg.evaluate(()=>{ for(let k=0;k<5;k++){const p=P.pieces[k]; p.inTray=false; P.tray=P.tray.filter(i=>i!==k); p.x=p.c*P.pw; p.y=p.r*P.ph; snap(p.g);} P.moves=5; save(); });
await pg.click('#back');await pg.waitForTimeout(300);
out.cardAfter=await pg.$eval('.box[data-slug^="photo-"] .size .s',e=>e.textContent);
// survives a reload (IndexedDB) and resumes
await pg.reload();await pg.waitForTimeout(800);
out.afterReload=await pg.evaluate(()=>({photos:PHOTOS.length,resume:document.querySelector('.box[data-slug^="photo-"] .size .s').textContent,cat:cat,synced:[...sync.dirty].filter(k=>k.startsWith('jig:photo-')).length}));
await pg.click('.box[data-slug^="photo-"] .size');await pg.waitForTimeout(2500);
out.resumed=await pg.evaluate(()=>({locked:[...P.groups.values()].filter(g=>g.locked).length,moves:P.moves}));
await pg.click('#back');await pg.waitForTimeout(300);
// db size
out.dbBytes=await pg.evaluate(async()=>{const r=indexedDB.open('puzzle-parlor-photos');return new Promise(res=>{r.onsuccess=()=>{const t=r.result.transaction('photos').objectStore('photos').getAll();t.onsuccess=()=>res(t.result.map(x=>({full:x.full.size,thumb:x.thumb.size})))}})});
// remove
await pg.click('.rmphoto');await pg.click('.rmphoto');await pg.waitForTimeout(500);
out.removed=await pg.evaluate(()=>({photos:PHOTOS.length,cards:document.querySelectorAll('.box[data-slug^="photo-"]').length,idxKeys:Object.keys(idx()).filter(k=>k.startsWith('jig:photo-')).length,addBtn:!!document.getElementById('addPhoto')}));
await pg.reload();await pg.waitForTimeout(800);out.removedPersists=await pg.evaluate(()=>PHOTOS.length);
// built-in puzzles still fine
await pg.evaluate(()=>{cat='halloween';renderTabs();renderGrid()});await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);out.builtin=await pg.evaluate(()=>P.count);
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close()})();
