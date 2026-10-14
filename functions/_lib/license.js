// Unlock-code licensing on Cloudflare KV (same namespace as progress sync, keys prefixed "lic:").
export const CORS={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-admin-key','access-control-max-age':'86400'};
export const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:Object.assign({'content-type':'application/json','cache-control':'no-store'},CORS)});
export const MAX_DEVICES=5;
// Settings: stored in KV under cfg:<NAME> (set from admin.html) with the Pages env var of the same name as fallback.
export const SETTING_NAMES=['SQUARE_WEBHOOK_SIGNATURE_KEY','SQUARE_NOTIFICATION_URL','PUZZLE_PRICE_CENTS','RESEND_API_KEY','LICENSE_FROM_EMAIL','LICENSE_REPLY_TO','APP_URL'];
export async function cfg(env,name){ const v=await env.PROGRESS.get('cfg:'+name); return (v!=null&&v!=='')?v:(env[name]||''); }
const ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
export function makeCode(){
  const b=new Uint8Array(12); crypto.getRandomValues(b);
  const s=[...b].map(x=>ALPHABET[x%ALPHABET.length]).join('');
  return `PP-${s.slice(0,4)}-${s.slice(4,8)}-${s.slice(8,12)}`;
}
export function normCode(raw){
  const s=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const body=s.startsWith('PP')?s.slice(2):s;
  if(body.length!==12||[...body].some(ch=>!ALPHABET.includes(ch))) return null;
  return `PP-${body.slice(0,4)}-${body.slice(4,8)}-${body.slice(8,12)}`;
}
export const licKey=code=>`lic:${code}`;
export async function getLicense(env,code){ const v=await env.PROGRESS.get(licKey(code)); return v?JSON.parse(v):null; }
export async function putLicense(env,code,lic){ await env.PROGRESS.put(licKey(code),JSON.stringify(lic)); }
export async function mint(env,{note='',email='',src='manual',order=''}={}){
  for(let i=0;i<5;i++){ const code=makeCode(); if(!(await getLicense(env,code))){ const lic={code,c:Date.now(),note,email,src,order,devices:[],max:MAX_DEVICES,revoked:false}; await putLicense(env,code,lic); return lic; } }
  throw new Error('could not mint a unique code');
}
// Register (or re-confirm) a device on a code. Returns {status, body}.
export async function activate(env,rawCode,device,name){
  const code=normCode(rawCode);
  if(!code) return {status:400,body:{ok:false,error:'bad_code',message:'That does not look like an unlock code. Codes look like PP-XXXX-XXXX-XXXX.'}};
  device=String(device||'').slice(0,64); if(!device) return {status:400,body:{ok:false,error:'bad_device'}};
  const lic=await getLicense(env,code);
  if(!lic) return {status:404,body:{ok:false,error:'unknown',message:'That code is not recognised. Check it for typos.'}};
  if(lic.revoked) return {status:403,body:{ok:false,error:'revoked',message:'This code has been cancelled.'}};
  const known=lic.devices.find(d=>d.id===device);
  if(!known){
    if(lic.devices.length>=(lic.max||MAX_DEVICES)) return {status:409,body:{ok:false,error:'device_limit',message:`This code is already in use on ${lic.max||MAX_DEVICES} devices. Remove one from another device first.`}};
    lic.devices.push({id:device,name:String(name||'').slice(0,60),at:Date.now()});
  } else { known.last=Date.now(); if(name) known.name=String(name).slice(0,60); }
  await putLicense(env,code,lic);
  return {status:200,body:{ok:true,code,devices:lic.devices.length,max:lic.max||MAX_DEVICES}};
}
export async function deactivate(env,rawCode,device){
  const code=normCode(rawCode); if(!code) return {status:400,body:{ok:false,error:'bad_code'}};
  const lic=await getLicense(env,code); if(!lic) return {status:404,body:{ok:false,error:'unknown'}};
  lic.devices=lic.devices.filter(d=>d.id!==device); await putLicense(env,code,lic);
  return {status:200,body:{ok:true,devices:lic.devices.length}};
}
export function adminOk(request,env){
  const want=env.LICENSE_ADMIN_KEY||''; const got=request.headers.get('x-admin-key')||'';
  if(!want||want.length!==got.length) return false;
  let diff=0; for(let i=0;i<want.length;i++) diff|=want.charCodeAt(i)^got.charCodeAt(i); return diff===0;
}
export async function sendCodeEmail(env,{to,code}){
  const key=await cfg(env,'RESEND_API_KEY'), from=await cfg(env,'LICENSE_FROM_EMAIL'), replyTo=await cfg(env,'LICENSE_REPLY_TO');
  if(!key||!from||!to) return false;
  const appUrl=(await cfg(env,'APP_URL'))||'https://puzzle-parlor-app.pages.dev/';
  const text=`Thank you for buying Puzzle Parlor!\n\nYour unlock code: ${code}\n\nHow to use it:\n1. Open ${appUrl} on your tablet, phone or computer (on iPad, use Safari and choose Share > Add to Home Screen to install it).\n2. Tap "Unlock" at the top of the puzzle gallery.\n3. Enter the code. Every puzzle opens on up to ${MAX_DEVICES} devices.\n\nKeep this email; the code is your proof of purchase.\n\nQuestions? Reply to this email.`;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:replyTo||undefined,subject:'Your Puzzle Parlor unlock code',text})});
  if(!r.ok){ let detail=''; try{detail=(await r.text()).slice(0,300)}catch{} throw new Error('Resend '+r.status+': '+detail); }
  return true;
}
