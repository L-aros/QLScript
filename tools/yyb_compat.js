const axios=require("axios");
const root=(process.env.YYB_SERVER_URL||"http://yyb-go:8000").replace(/\/$/,"");
axios.interceptors.request.use(c=>{
 if(!String(c.url||"").startsWith(root+"/wx/"))return c;
 let body=c.data;if(typeof body==="string")try{body=JSON.parse(body)}catch{}
 if(body&&typeof body==="object"){
  const ref=body.ref||body.openid||body.userKey,appid=body.app_id||body.appid;
  c.data={...body,ref:String(ref||""),app_id:appid};delete c.data.openid;delete c.data.appid;delete c.data.userKey;
 }
 c.headers=c.headers||{};delete c.headers.auth;c.headers.Authorization="Bearer "+(process.env.YYB_PROTOCOL_TOKEN||"");return c;
});
axios.interceptors.response.use(r=>{
 if(!String(r.config.url||"").startsWith(root+"/wx/"))return r;
 const d=r.data;if(d?.code===0&&d.data?.result){const result=d.data.result;d.data={...d.data,...result,raw:result};d.status=true;}
 return r;
});
