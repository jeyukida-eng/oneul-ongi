// Naver validates the bearer token before any identity is returned.
// No app secret, database key, token logging, or arbitrary upstream URL.
Deno.serve(async (req) => {
 const headers = {"Content-Type":"application/json","Cache-Control":"no-store"};
 const error=(status,message)=>new Response(JSON.stringify({error:message}),{status,headers});
 if(req.method!=="GET")return error(405,"method_not_allowed");
 const authorization=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._~+\/-]+=*$/i.test(authorization)||authorization.length>4096)return error(401,"invalid_token");
 try{
  const upstream=await fetch("https://openapi.naver.com/v1/nid/me",{headers:{Authorization:authorization},redirect:"error",signal:AbortSignal.timeout(8000)});
  if(!upstream.ok)return error(401,"invalid_token");
  const data=await upstream.json();
  const id=data?.response?.id;
  if(data.resultcode!=="00"||typeof id!=="string"||!id)return error(401,"invalid_identity");
  return new Response(JSON.stringify({sub:id}),{headers});
 }catch{return error(502,"identity_provider_unavailable");}
});