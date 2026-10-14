// Progress sync: one KV value per (sync code, puzzle). Keys: "<code>:index" and "<code>:jig:<slug>:<size>".
const CODE=/^[a-z0-9-]{6,40}$/, KEY=/^(index|jig:[a-z0-9-]+:\d+)$/, MAX=2_000_000;
const json=(body,status=200)=>new Response(body,{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export async function onRequest({request,env,params}){
  const code=String(params.code||''), key=String(params.key||'');
  if(!CODE.test(code)||!KEY.test(key)) return new Response('Bad request',{status:400});
  const k=`${code}:${key}`;
  switch(request.method){
    case 'GET':{ const v=await env.PROGRESS.get(k); return v==null?new Response('Not found',{status:404}):json(v); }
    case 'PUT':{
      const b=await request.text(); if(b.length>MAX) return new Response('Too large',{status:413});
      try{JSON.parse(b)}catch{return new Response('Bad JSON',{status:400})}
      await env.PROGRESS.put(k,b); return new Response(null,{status:204});
    }
    case 'DELETE': await env.PROGRESS.delete(k); return new Response(null,{status:204});
    default: return new Response('Method not allowed',{status:405});
  }
}
