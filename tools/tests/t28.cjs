const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:1100,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(400);
await pg.click('.box:first-of-type .size');await pg.waitForTimeout(2500);await pg.click('#hardBtn');await pg.waitForTimeout(200);
const s0=await pg.evaluate(()=>({hard:P.hard,loupeShown:!document.getElementById('loupeWrap').hidden,empty:document.getElementById('loupeWrap').classList.contains('empty'),btn:!document.getElementById('loupeBtn').hidden}));
// click on a loose piece: find one on the table and click its screen position
const pt=await pg.evaluate(()=>{spreadOut();const p=P.pieces.find(q=>!q.inTray);const r=cv.getBoundingClientRect();return {x:r.left+(p.x+P.pw/2-cam.x)*cam.z,y:r.top+(p.y+P.ph/2-cam.y)*cam.z,rot:p.rot,g:p.g}});
await pg.mouse.click(pt.x,pt.y);await pg.waitForTimeout(300);
const s1=await pg.evaluate(()=>{const c=document.getElementById('loupe');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return {lastId:P.lastId,empty:document.getElementById('loupeWrap').classList.contains('empty'),painted:n/(c.width*c.height),moves:P.moves}});
await pg.click('#loupeCW');await pg.waitForTimeout(150);const r1=await pg.evaluate((g)=>({rot:P.pieces[P.groups.get(g).members[0]].rot,moves:P.moves}),pt.g);
await pg.click('#loupeCCW');await pg.waitForTimeout(150);const r2=await pg.evaluate((g)=>({rot:P.pieces[P.groups.get(g).members[0]].rot,moves:P.moves}),pt.g);
await pg.screenshot({path:'mk/loupe.png',clip:{x:0,y:60,width:320,height:360}});
await pg.keyboard.press('m');await pg.waitForTimeout(200);const hid=await pg.evaluate(()=>document.getElementById('loupeWrap').hidden);
await pg.keyboard.press('m');await pg.waitForTimeout(200);const shown=await pg.evaluate(()=>!document.getElementById('loupeWrap').hidden);
console.log(JSON.stringify({s0,startRot:pt.rot,s1,afterCW:r1,afterCCW:r2,hiddenByM:hid,shownAgain:shown,errs}));await b.close()})();
