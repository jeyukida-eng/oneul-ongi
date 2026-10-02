// Naver validates the bearer token before any identity is returned.
// No app secret, database key, token logging, or arbitrary upstream URL.
Deno.serve(async (req) => {
 const headers = {"Content-Type":"application/json","Cache-Control":"no-store"};
 const error=(status,message)=>new Response(JSON.stringify({error:message}),{status,headers});

 if(new URL(req.url).pathname.endsWith("/token")){
  if(req.method!=="POST")return error(405,"method_not_allowed");
  if(Number(req.headers.get("content-length")||0)>8192)return error(413,"invalid_request");
  const raw=await req.text();
  if(raw.length>8192)return error(413,"invalid_request");
  const body=new URLSearchParams(raw);
  const auth=req.headers.get("authorization")||"";
  if(auth.startsWith("Basic ")){
   try{
    const pair=atob(auth.slice(6));const split=pair.indexOf(":");
    body.set("client_id",decodeURIComponent(pair.slice(0,split)));
    body.set("client_secret",decodeURIComponent(pair.slice(split+1)));
   }catch{return error(401,"invalid_client");}
  }
  if(body.get("client_id")!=="OlzbrtI8EjVbkZOkmT5w"||!body.get("client_secret"))return error(401,"invalid_client");
  if(body.get("grant_type")!=="authorization_code"&&body.get("grant_type")!=="refresh_token")return error(400,"unsupported_grant_type");
  if(body.get("grant_type")==="authorization_code"&&body.get("redirect_uri")!=="https://chnlljbmatsawxrrsany.supabase.co/auth/v1/callback")return error(400,"invalid_redirect_uri");
  try{
   const upstream=await fetch("https://nid.naver.com/oauth2.0/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,redirect:"error",signal:AbortSignal.timeout(8000)});
   const data=await upstream.json();
   if(!upstream.ok||typeof data.access_token!=="string"){const message=String(data.error_description||"");const reason=/client id|client secret/i.test(message)?"invalid_client_credentials":/state/i.test(message)?"invalid_state":/code/i.test(message)?"invalid_code":"invalid_request";return new Response(JSON.stringify({error:typeof data.error==="string"?data.error:"invalid_grant",error_description:reason}),{status:400,headers});}
   return new Response(JSON.stringify(data),{headers});
  }catch{return error(502,"identity_provider_unavailable");}
 }
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