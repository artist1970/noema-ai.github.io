import test from "node:test";
import assert from "node:assert/strict";
import {SecureHttpProvider} from "../providers/http-provider.js";

test("secure HTTP provider sends cookie credentials but no browser Authorization header",async()=>{
  let seen=null;
  const provider=new SecureHttpProvider({
    enabled:true,id:"secure-http",baseUrl:"https://noema.example.org",
    endpointPath:"/api/v1/noema/respond",timeoutMs:5000
  },async(url,options)=>{
    seen={url,options};
    return {
      ok:true,status:200,
      headers:{get:()=> "application/json"},
      json:async()=>({text:"ok",generatedByModel:true})
    };
  });

  const out=await provider.respond({message:{content:"hello"}});
  assert.equal(out.text,"ok");
  assert.equal(seen.options.credentials,"include");
  assert.equal("Authorization" in seen.options.headers,false);
});
