const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];const out={};
const ctx=await b.newContext({viewport:{width:1000,height:720}});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
let posted=null; await pg.route('**/api/contact',r=>{posted=JSON.parse(r.request().postData()); r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'})});
await pg.goto('http://127.0.0.1:8768/?lock=1');await pg.waitForTimeout(500);
await pg.evaluate(()=>localStorage.setItem('jig-lic',JSON.stringify({code:'PP-TEST-CODE-0001',ok:true})));await pg.reload();await pg.waitForTimeout(500);
await pg.click('#helpBtn');await pg.waitForTimeout(200);
out.opened=await pg.evaluate(()=>({shown:!document.getElementById('help').hidden,code:document.getElementById('helpCode').value,focused:document.activeElement.id}));
await pg.screenshot({path:'help1.png'});
await pg.click('#helpSend');await pg.waitForTimeout(100); out.validation=await pg.$eval('#helpMsg',e=>e.textContent);
await pg.fill('#helpEmail','buyer@example.com');await pg.fill('#helpText','The Witch\'s Kitchen will not open on my iPad');await pg.click('#helpSend');await pg.waitForTimeout(300);
out.sent=await pg.$eval('#helpMsg',e=>e.textContent); out.posted=posted; await pg.waitForTimeout(2400); out.closedAfter=await pg.evaluate(()=>document.getElementById('help').hidden);
// from the unlock dialog
await pg.evaluate(()=>localStorage.removeItem('jig-lic'));await pg.reload();await pg.waitForTimeout(500);await pg.click('#unlockBtn');await pg.waitForTimeout(200);await pg.click('#unlockHelp');await pg.waitForTimeout(200);
out.fromUnlock=await pg.evaluate(()=>({helpShown:!document.getElementById('help').hidden,unlockHidden:document.getElementById('unlock').hidden}));
await pg.keyboard.press('Escape');await pg.waitForTimeout(100);out.escClosed=await pg.evaluate(()=>document.getElementById('help').hidden);
// phone
const m=await (await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true})).newPage();await m.goto('http://127.0.0.1:8768/');await m.waitForTimeout(500);await m.click('#helpBtn');await m.waitForTimeout(200);await m.screenshot({path:'help2.png'});
out.phoneOverflow=await m.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
out.errs=errs;console.log(JSON.stringify(out,null,1));await b.close()})();
