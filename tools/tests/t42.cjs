const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];const out={};
const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('http://127.0.0.1:8768/');await pg.waitForTimeout(500);await pg.tap('.box:first-of-type .size:nth-of-type(2)');await pg.waitForTimeout(3000);
await pg.tap('#sort');await pg.waitForTimeout(400);
const cdp=await ctx.newCDPSession(pg);
async function swipe(x0,y0,x1,y1,steps=12){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});for(let k=1;k<=steps;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*k/steps,y:y0+(y1-y0)*k/steps}]});await pg.waitForTimeout(16)}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
const p=await pg.evaluate(()=>{const p=P.pieces.find(q=>!q.inTray);const rc=cv.getBoundingClientRect();return {i:P.pieces.indexOf(p),x:rc.left+(p.x+P.pw/2-cam.x)*cam.z,y:rc.top+(p.y+P.ph/2-cam.y)*cam.z,z:cam.z}});
// 1) touch on the piece centre, drag 120,80 — piece should move by exactly that (no jump)
let bf=await pg.evaluate(i=>({x:P.pieces[i].x,y:P.pieces[i].y,cx:cam.x,cy:cam.y}),p.i);
await swipe(p.x,p.y,p.x+120,p.y+80);await pg.waitForTimeout(200);
let af=await pg.evaluate(i=>({x:P.pieces[i].x,y:P.pieces[i].y,cx:cam.x,cy:cam.y}),p.i);
out.onPiece={dxScreen:((af.x-bf.x)*p.z).toFixed(1),dyScreen:((af.y-bf.y)*p.z).toFixed(1),camMoved:af.cx!==bf.cx};
// 2) find an empty spot 25px from a piece edge and touch there — should pan, not grab
const q=await pg.evaluate(()=>{const rc=cv.getBoundingClientRect();for(const p of P.pieces){if(p.inTray)continue;const sx=rc.left+(p.x+P.pw-cam.x)*cam.z+25, sy=rc.top+(p.y+P.ph/2-cam.y)*cam.z;const[wx,wy]=world(sx-rc.left,sy-rc.top);if(hitTest(wx,wy,0)==null&&sx<rc.right-150&&sy>rc.top+100&&sy<rc.bottom-100)return{i:P.pieces.indexOf(p),x:sx,y:sy}}});
bf=await pg.evaluate(i=>({x:P.pieces[i].x,y:P.pieces[i].y,cx:cam.x,all:JSON.stringify(P.pieces.map(p=>[p.x,p.y])),lock:flags.lock}),q.i);
await swipe(q.x,q.y,q.x+60,q.y);await pg.waitForTimeout(200);
af=await pg.evaluate(i=>({x:P.pieces[i].x,y:P.pieces[i].y,cx:cam.x,all:JSON.stringify(P.pieces.map(p=>[p.x,p.y]))}),q.i);
out.nearMiss={anyMoved:af.all!==bf.all,tablePanned:af.cx!==bf.cx,lock:bf.lock};
out.errs=errs;console.log(JSON.stringify(out));await b.close()})();
