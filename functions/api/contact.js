// POST /api/contact  {name,email,message,code?,website?(honeypot)} -> emails the message to the support inbox via Resend
import { json, CORS, cfg } from '../_lib/license.js';
const SUPPORT_TO='puzzles@kandyphoenix.com';
const LIMIT=5, WINDOW=3600; // messages per IP per hour
export async function onRequestOptions(){ return new Response(null,{status:204,headers:CORS}); }
export async function onRequestPost({request,env}){
  let body={}; try{ body=await request.json(); }catch{ return json({ok:false,error:'bad_json'},400); }
  if(body.website) return json({ok:true}); // honeypot filled in: pretend success, send nothing
  const name=String(body.name||'').trim().slice(0,120), email=String(body.email||'').trim().slice(0,200), message=String(body.message||'').trim().slice(0,4000), code=String(body.code||'').trim().slice(0,40);
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ok:false,error:'bad_email'},400);
  if(message.length<5) return json({ok:false,error:'empty_message'},400);
  const ip=request.headers.get('cf-connecting-ip')||'?'; const rk='contact:'+ip;
  const n=parseInt(await env.PROGRESS.get(rk)||'0',10); if(n>=LIMIT) return json({ok:false,error:'rate_limited'},429);
  await env.PROGRESS.put(rk,String(n+1),{expirationTtl:WINDOW});
  const key=await cfg(env,'RESEND_API_KEY'), from=await cfg(env,'LICENSE_FROM_EMAIL'); if(!key||!from) return json({ok:false,error:'mail_not_configured'},503);
  const text=`From: ${name||'(no name)'} <${email}>\nUnlock code: ${code||'(none given)'}\nIP: ${ip}\nPage: ${String(body.page||'').slice(0,200)}\nDevice: ${(request.headers.get('user-agent')||'').slice(0,200)}\n\n${message}`;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'},body:JSON.stringify({from,to:[SUPPORT_TO],reply_to:email,subject:`Puzzle Parlor help: ${(message.split('\n')[0]||'').slice(0,60)}`,text})});
  if(!r.ok) return json({ok:false,error:'send_failed'},502);
  return json({ok:true});
}
