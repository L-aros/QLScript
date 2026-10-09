// 得物星愿：默认只读验证；自动提交需显式启用。
// cron: 45 8 * * *
const axios=require("axios").create({timeout:20000});
const crypto=require("crypto");
const {Env}=require("../tools/env");
const $=new Env("得物星愿签到");
function sign(p){const secret=process.env.DEWU_SIGN_SECRET;if(!secret)throw new Error("请配置 DEWU_SIGN_SECRET");return crypto.createHash("md5").update(Object.keys(p).sort().filter(k=>p[k]!==null).map(k=>k+String(p[k])).join("")+secret).digest("hex");}
(async()=>{
 const raw=process.env.DEWU_STARWISH_ACCOUNTS;
 if(!raw){$.log("未配置 DEWU_STARWISH_ACCOUNTS");return;}
 const parsed=JSON.parse(raw);const accounts=Array.isArray(parsed)?parsed:[parsed];
 for(let i=0;i<accounts.length;i++)try{
  const a=accounts[i],host="https://dcdn-app-huawei.dewu.com";
  const params=a.homeParams||{};
  const {data:r}=await axios.get(host+"/hacking-game-platform/v1/starwish/home",{params:{...params,sign:sign(params)},headers:a.headers});
  if(String(r.code)!=="200"||!r.data?.checkinInfo)throw new Error("状态查询失败，业务码="+r.code);
  const info=r.data.checkinInfo;
  $.log(`账号[${i+1}] 状态查询成功，连续天数=${info.continuousDays}，todayPoints=${info.todayPoints}`);
  if(process.env.DEWU_STARWISH_ENABLE_SIGN!=="1"){$.log("只读模式：未提交签到；状态字段语义仍待核实");continue;}
  const body={channelSource:"growth"};
  const {data:s}=await axios.post(host+"/hacking-game-platform/v1/starwish/checkin",body,{params:{sign:sign(body)},headers:a.headers});
  if(String(s.code)==="200"&&s.data?.success===true)$.log(`账号[${i+1}] 签到成功`);
  else $.log(`账号[${i+1}] 签到响应：${s.code} ${s.msg||""}`);
 }catch(e){$.log(`账号[${i+1}] 执行失败：${e.response?"HTTP "+e.response.status:e.code||e.message}`);}
})().catch(()=>$.log("配置解析失败，请检查账号 JSON")).finally(()=>$.done());
