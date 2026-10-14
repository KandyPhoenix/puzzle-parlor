import {json,CORS,activate,deactivate,mint,adminOk,getLicense,putLicense,normCode,SETTING_NAMES} from '../../_lib/license.js';
export async function onRequest({request,env,params}){
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:CORS});
  const action=String(params.action||'');
  let body={}; if(request.method==='POST'){ try{ body=await request.json(); }catch{ return json({ok:false,error:'bad_json'},400); } }
  switch(action){
    case 'status': return json({ok:true,locking:!!env.LICENSE_ADMIN_KEY});
    case 'activate': { if(request.method!=='POST') break; const r=await activate(env,body.code,body.device,body.name); return json(r.body,r.status); }
    case 'deactivate': { if(request.method!=='POST') break; const r=await deactivate(env,body.code,body.device); return json(r.body,r.status); }
    // ---- admin (header x-admin-key must match the LICENSE_ADMIN_KEY secret) ----
    case 'mint': case 'list': case 'revoke': case 'unrevoke': case 'settings': {
      if(!env.LICENSE_ADMIN_KEY) return json({ok:false,error:'admin_not_configured',message:'Set the LICENSE_ADMIN_KEY secret on the Pages project.'},503);
      if(!adminOk(request,env)) return json({ok:false,error:'forbidden'},403);
      if(action==='settings'){
        const set=body.set||{};
        for(const k of Object.keys(set)){ if(!SETTING_NAMES.includes(k)) return json({ok:false,error:'unknown_setting',name:k},400); const v=String(set[k]||'').trim(); if(v) await env.PROGRESS.put('cfg:'+k,v); else await env.PROGRESS.delete('cfg:'+k); }
        const out={}; for(const k of SETTING_NAMES){ const kv=await env.PROGRESS.get('cfg:'+k); const v=kv||env[k]||''; const secret=/KEY/.test(k); out[k]={set:!!v,source:kv?'admin':(env[k]?'env':''),preview:v?(secret?v.slice(0,4)+'…'+v.slice(-3):v):''}; }
        return json({ok:true,settings:out});
      }
      if(action==='mint'){
        const n=Math.min(100,Math.max(1,parseInt(body.count)||1)); const out=[];
        for(let i=0;i<n;i++) out.push((await mint(env,{note:String(body.note||'').slice(0,120),email:String(body.email||'').slice(0,120)})).code);
        return json({ok:true,codes:out});
      }
      if(action==='list'){
        const keys=await env.PROGRESS.list({prefix:'lic:',limit:1000}); const items=[];
        for(const k of keys.keys.slice(0,300)){ const v=await env.PROGRESS.get(k.name); if(v) items.push(JSON.parse(v)); }
        items.sort((a,b)=>b.c-a.c); return json({ok:true,count:keys.keys.length,licenses:items});
      }
      const code=normCode(body.code); if(!code) return json({ok:false,error:'bad_code'},400);
      const lic=await getLicense(env,code); if(!lic) return json({ok:false,error:'unknown'},404);
      lic.revoked=action==='revoke'; await putLicense(env,code,lic); return json({ok:true,code,revoked:lic.revoked});
    }
  }
  return json({ok:false,error:'not_found'},404);
}
