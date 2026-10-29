const {chromium}=require('playwright');const S=process.argv[2];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1200,height:900},acceptDownloads:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const out={};
await p.goto('http://127.0.0.1:8771/');await p.waitForTimeout(1200);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1200);
out.hearts=await p.evaluate(()=>document.querySelectorAll('#grid .fav').length);
const first=await p.evaluate(()=>document.querySelector('#grid .box').dataset.slug);
await p.click('#grid .box .fav');await p.waitForTimeout(300);
out.lookStayedClosed=await p.evaluate(()=>document.getElementById('look').hidden);
out.pressed=await p.evaluate(s=>document.querySelector(`#grid .fav[data-fav="${s}"]`).getAttribute('aria-pressed'),first);
out.toast=await p.evaluate(()=>document.getElementById('ppToast').textContent);
await p.click('#grid .box .art img');await p.waitForTimeout(300);out.artStillOpensLook=await p.evaluate(()=>!document.getElementById('look').hidden);
await p.evaluate(()=>{document.getElementById('look').hidden=true});
await p.reload();await p.waitForTimeout(1200);
out.persisted=await p.evaluate(s=>isFav(s),first);
out.menuHasMine=await p.evaluate(()=>[...document.querySelectorAll('#themeMenu .pick')].map(b=>b.textContent).slice(0,3));
await p.evaluate(()=>{cat='mine';renderTabs();renderGrid()});await p.waitForTimeout(300);
out.mine=await p.evaluate(()=>({title:shelfTitle.textContent,heads:[...document.querySelectorAll('.grouphead')].map(h=>h.textContent),boxes:[...document.querySelectorAll('#grid .box')].map(b=>b.dataset.slug)}));
await p.screenshot({path:S+'/pp-mine.png',clip:{x:0,y:440,width:1200,height:460}});
// start and finish a puzzle, then share
await p.evaluate(()=>openPuzzle(findImg('poppy-field'),100));await p.waitForTimeout(2500);
await p.evaluate(()=>{P.elapsed=4321000;P.moves=210;celebrate()});await p.waitForTimeout(4500);
out.winShown=await p.evaluate(()=>!document.getElementById('win').hidden&&!!document.getElementById('winShare'));
// capture the shared file through a fake share sheet
await p.evaluate(()=>{window.__shared=null;navigator.canShare=()=>true;navigator.share=async d=>{const f=d.files[0];window.__shared={name:f.name,type:f.type,size:f.size,text:d.text,url:await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})}}});
await p.click('#winShare');await p.waitForTimeout(2500);
const sh=await p.evaluate(()=>window.__shared);out.share=sh&&{name:sh.name,type:sh.type,kb:Math.round(sh.size/1024),text:sh.text};
if(sh) require('fs').writeFileSync(S+'/pp-share.jpg',Buffer.from(sh.url.split(',')[1],'base64'));
// fallback path: no share sheet at all
await p.evaluate(()=>{delete navigator.canShare;navigator.share=undefined;navigator.canShare=undefined});
const dl=p.waitForEvent('download',{timeout:8000}).catch(()=>null);await p.click('#winShare');const d=await dl;out.fallbackDownload=d?d.suggestedFilename():null;await p.waitForTimeout(500);out.fallbackToast=await p.evaluate(()=>document.getElementById('ppToast').textContent);
await p.evaluate(()=>{leave&&leave()}).catch(()=>{});
await p.goto('http://127.0.0.1:8771/');await p.waitForTimeout(1200);await p.evaluate(()=>{cat='mine';renderTabs();renderGrid()});
out.mineAfterFinish=await p.evaluate(()=>[...document.querySelectorAll('.grouphead')].map(h=>h.textContent));
console.log(JSON.stringify(out,null,1),JSON.stringify(errs));await b.close()})();
