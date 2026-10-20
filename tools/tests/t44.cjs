const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];const out={};
for(const [name,vp] of [['desk',{width:1100,height:800}],['phone',{width:390,height:800}]]){
 const pg=await b.newPage({viewport:vp});pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(700);
 out[name]=await pg.evaluate(()=>({promo:!document.getElementById('promo').hidden,title:document.getElementById('promoTitle').textContent,ends:document.getElementById('promoEnds').textContent,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
   freeNow:[...FREE].filter(s=>['monster-ball','haunted-village','witches-sabbath','triumph-of-death'].includes(s))}));
 await pg.click('#promoBtn');await pg.waitForTimeout(600);
 out[name].afterBtn=await pg.evaluate(()=>({cat,firstBox:document.querySelector('#grid .box').dataset.slug}));
 await pg.screenshot({path:`promo_${name}.png`});
 // simulate after Nov 1: FREE should drop monster-ball
 out[name].afterPromo=await pg.evaluate(()=>{const now=new Date('2026-11-02T12:00:00').getTime();const F=new Set();const seen={};for(const i of IMAGES){if(PROMO_FREE.has(i.slug))continue;seen[i.cat]=(seen[i.cat]||0)+1;if(seen[i.cat]<=FREE_PER_CAT)F.add(i.slug)}for(const p of PROMOS)if(p.free&&now<new Date(p.until).getTime())F.add(p.slug);return [...F].filter(s=>['monster-ball','haunted-village','witches-sabbath'].includes(s))});
 await pg.close();
}
console.log(JSON.stringify({out,errs}));await b.close()})();
