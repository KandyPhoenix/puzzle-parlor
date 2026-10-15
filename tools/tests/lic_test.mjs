import {activate,deactivate,mint,normCode,adminOk} from '/home/user/puzzle-parlor/functions/_lib/license.js';
import {onRequest} from '/home/user/puzzle-parlor/functions/api/license/[action].js';
import {onRequestPost as hook} from '/home/user/puzzle-parlor/functions/api/square/webhook.js';
const kv=new Map(); const env={PROGRESS:{get:async k=>kv.get(k)??null,put:async(k,v)=>kv.set(k,v),delete:async k=>kv.delete(k),list:async({prefix})=>({keys:[...kv.keys()].filter(k=>k.startsWith(prefix)).map(name=>({name}))})},LICENSE_ADMIN_KEY:'secret1',SQUARE_WEBHOOK_SIGNATURE_KEY:'sqkey',PUZZLE_PRICE_CENTS:'299'};
const ok=(c,m)=>{ if(!c) throw new Error('FAIL '+m); console.log('ok',m); };
const lic=await mint(env,{note:'t'}); ok(/^PP-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(lic.code),'code format '+lic.code);
ok(normCode(lic.code.toLowerCase().replace(/-/g,' '))===lic.code,'normalises messy input');
ok(normCode('PP-0000-0000-0000')===null,'rejects ambiguous chars');
let r=await activate(env,lic.code,'dev1','iPad'); ok(r.status===200&&r.body.devices===1,'activate dev1');
r=await activate(env,lic.code,'dev1'); ok(r.status===200&&r.body.devices===1,'re-activate same device idempotent');
for(const d of ['d2','d3']) r=await activate(env,lic.code,d); ok(r.status===200&&r.body.devices===3,'three devices');
r=await activate(env,lic.code,'d4'); ok(r.status===409,'fourth device refused');
r=await deactivate(env,lic.code,'d3'); r=await activate(env,lic.code,'d4'); ok(r.status===200,'freed slot reusable');
r=await activate(env,'PP-ZZZZ-ZZZZ-ZZZZ','x'); ok(r.status===404,'unknown code');
r=await activate(env,'nonsense','x'); ok(r.status===400,'bad code');
// router + admin
const req=(action,body,headers={})=>new Request('https://x/api/license/'+action,{method:'POST',body:JSON.stringify(body),headers:{'content-type':'application/json',...headers}});
let res=await onRequest({request:req('mint',{count:2}),env,params:{action:'mint'}}); ok(res.status===403,'mint without key refused');
res=await onRequest({request:req('mint',{count:2,note:'batch'},{'x-admin-key':'secret1'}),env,params:{action:'mint'}}); let j=await res.json(); ok(j.ok&&j.codes.length===2,'mint 2 codes');
res=await onRequest({request:req('revoke',{code:j.codes[0]},{'x-admin-key':'secret1'}),env,params:{action:'revoke'}}); ok((await res.json()).revoked===true,'revoke');
res=await onRequest({request:req('activate',{code:j.codes[0],device:'q'}),env,params:{action:'activate'}}); ok(res.status===403,'revoked code refused');
res=await onRequest({request:new Request('https://x/api/license/list',{headers:{'x-admin-key':'secret1'}}),env,params:{action:'list'}}); j=await res.json(); ok(j.ok&&j.licenses.length===3,'list shows 3');
res=await onRequest({request:new Request('https://x/api/license/activate',{method:'OPTIONS'}),env,params:{action:'activate'}}); ok(res.status===204&&res.headers.get('access-control-allow-origin')==='*','CORS preflight');
// square webhook
const crypto=globalThis.crypto; const sign=async(url,raw)=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode('sqkey'),{name:'HMAC',hash:'SHA-256'},false,['sign']);return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(url+raw)))))};
const url='https://x/api/square/webhook'; const evt=JSON.stringify({type:'payment.updated',data:{object:{payment:{id:'pay1',status:'COMPLETED',order_id:'o1',buyer_email_address:'buyer@example.com',amount_money:{amount:299,currency:'USD'}}}}});
res=await hook({request:new Request(url,{method:'POST',body:evt,headers:{'x-square-hmacsha256-signature':'bad'}}),env}); ok(res.status===401,'webhook bad signature');
res=await hook({request:new Request(url,{method:'POST',body:evt,headers:{'x-square-hmacsha256-signature':await sign(url,evt)}}),env}); j=await res.json(); ok(j.ok&&/^PP-/.test(j.code)&&j.emailed===false,'webhook mints code (no email key)');
res=await hook({request:new Request(url,{method:'POST',body:evt,headers:{'x-square-hmacsha256-signature':await sign(url,evt)}}),env}); j=await res.json(); ok(j.ignored==='already processed','webhook dedupes');
const evt2=evt.replace('"amount":299','"amount":50000'); res=await hook({request:new Request(url,{method:'POST',body:evt2,headers:{'x-square-hmacsha256-signature':await sign(url,evt2)}}),env}); j=await res.json(); ok(/amount/.test(j.ignored),'wrong amount ignored');
console.log('ALL LICENSE TESTS PASSED');
// settings via admin
res=await onRequest({request:req('settings',{set:{PUZZLE_PRICE_CENTS:'399',SQUARE_WEBHOOK_SIGNATURE_KEY:'sqkey2'}},{'x-admin-key':'secret1'}),env,params:{action:'settings'}}); j=await res.json(); ok(j.ok&&j.settings.PUZZLE_PRICE_CENTS.preview==='399'&&j.settings.SQUARE_WEBHOOK_SIGNATURE_KEY.preview==='sqke…ey2','settings saved and masked');
const evt3=evt.replace('"amount":299','"amount":399').replace('pay1','pay3'); const sign2=async(url,raw)=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode('sqkey2'),{name:'HMAC',hash:'SHA-256'},false,['sign']);return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(url+raw)))))};
res=await hook({request:new Request(url,{method:'POST',body:evt3,headers:{'x-square-hmacsha256-signature':await sign2(url,evt3)}}),env}); j=await res.json(); ok(j.ok&&/^PP-/.test(j.code),'webhook uses KV settings (new key + price)');
res=await onRequest({request:req('settings',{set:{BOGUS:'x'}},{'x-admin-key':'secret1'}),env,params:{action:'settings'}}); ok(res.status===400,'unknown setting rejected');
console.log('SETTINGS TESTS PASSED');
// price in KV is 399 at this point: 399..466 accepted, 299 and 500 rejected
for(const [amt,want] of [[399,true],[432,true],[466,true],[299,false],[500,false]]){ const e=evt.replace('"amount":299','"amount":'+amt).replace('pay1','payT'+amt); res=await hook({request:new Request(url,{method:'POST',body:e,headers:{'x-square-hmacsha256-signature':await sign2(url,e)}}),env}); j=await res.json(); ok((!!j.code)===want,'amount '+amt+(want?' accepted':' rejected')); }
console.log('TAX TOLERANCE TESTS PASSED');
