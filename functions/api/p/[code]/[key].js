// Progress sync: one KV value per (sync code, puzzle). Keys: "<code>:index" and "<code>:jig:<slug>:<size>".
const CODE=/^[a-z0-9-]{6,40}$/, KEY=/^(index|jig:[a-z0-9-]+:\d+)$/, MAX=2_000_000;
const CORS={'access-control-allow-origin':'*','access-control-allow-methods':'GET,PUT,DELETE,OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400'};
const resp=(body,status=200,extra={})=>new Response(body,{status,headers:Object.assign({},CORS,extra)});
const json=(body,status=200)=>resp(body,status,{'content-type':'application/json','cache-control':'no-store'});
export async function onRequest({request,env,params}){
  if(request.method==='OPTIONS') return resp(null,204);
  let code,key; try{code=decodeURIComponent(String(params.code||''));key=decodeURIComponent(String(params.key||''))}catch{return resp('Bad request',400)}
  if(!CODE.test(code)||!KEY.test(key)) return resp('Bad request',400);
  const k=`${code}:${key}`;
  switch(request.method){
    case 'GET':{ const v=await env.PROGRESS.get(k); return v==null?resp('Not found',404):json(v); }
    case 'PUT':{
      const b=await request.text(); if(b.length>MAX) return resp('Too large',413);
      try{JSON.parse(b)}catch{return resp('Bad JSON',400)}
      await env.PROGRESS.put(k,b); return resp(null,204);
    }
    case 'DELETE': await env.PROGRESS.delete(k); return resp(null,204);
    default: return resp('Method not allowed',405);
  }
}
