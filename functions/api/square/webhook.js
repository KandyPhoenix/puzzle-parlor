// Square webhook: a COMPLETED payment for the puzzle price mints an unlock code and emails it to the buyer.
// Configure in Square Developer Dashboard > Webhooks: URL https://<host>/api/square/webhook, events payment.created + payment.updated.
// Secrets on the Pages project: SQUARE_WEBHOOK_SIGNATURE_KEY (required), PUZZLE_PRICE_CENTS (e.g. 299, recommended so SEO-client
// payments on the same Square account never mint codes), RESEND_API_KEY + LICENSE_FROM_EMAIL (to email the code automatically).
import {mint,sendCodeEmail,json,cfg} from '../../_lib/license.js';
async function validSignature(request,raw,env){
  const key=await cfg(env,'SQUARE_WEBHOOK_SIGNATURE_KEY'); if(!key) return false;
  const url=(await cfg(env,'SQUARE_NOTIFICATION_URL'))||request.url;
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const sig=await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(url+raw));
  const expect=btoa(String.fromCharCode(...new Uint8Array(sig)));
  const got=request.headers.get('x-square-hmacsha256-signature')||'';
  if(expect.length!==got.length) return false; let d=0; for(let i=0;i<expect.length;i++) d|=expect.charCodeAt(i)^got.charCodeAt(i); return d===0;
}
export async function onRequestPost({request,env}){
  const raw=await request.text();
  if(!(await validSignature(request,raw,env))) return new Response('Bad signature',{status:401});
  let ev; try{ ev=JSON.parse(raw); }catch{ return new Response('Bad JSON',{status:400}); }
  const pay=ev&&ev.data&&ev.data.object&&ev.data.object.payment;
  if(!pay||pay.status!=='COMPLETED') return json({ok:true,ignored:'not a completed payment'});
  const price=parseInt((await cfg(env,'PUZZLE_PRICE_CENTS'))||'0')||0;
  const amt=pay.amount_money&&pay.amount_money.amount; // base price, or base price plus up to ~17% sales tax if tax is ever switched on in Square
  if(price&&!(amt>=price&&amt<=Math.round(price*1.17)&&(pay.amount_money.currency||'USD')==='USD')) return json({ok:true,ignored:'amount does not match PUZZLE_PRICE_CENTS'});
  const dedupe=`sqpay:${pay.id}`; if(await env.PROGRESS.get(dedupe)) return json({ok:true,ignored:'already processed'});
  const email=pay.buyer_email_address||'';
  const lic=await mint(env,{src:'square',email,order:pay.order_id||pay.id,note:'Square payment'});
  let emailed=false; try{ emailed=await sendCodeEmail(env,{to:email,code:lic.code}); }catch{}
  if(emailed){ lic.emailed=Date.now(); await env.PROGRESS.put(`lic:${lic.code}`,JSON.stringify(lic)); }
  await env.PROGRESS.put(dedupe,JSON.stringify({code:lic.code,at:Date.now(),emailed}),{expirationTtl:60*60*24*90});
  return json({ok:true,code:lic.code,emailed});
}
