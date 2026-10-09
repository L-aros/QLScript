# 书亦烧仙草：签到状态检查，需人机验证时提示人工处理
import os,re,datetime,requests
from zoneinfo import ZoneInfo
try:
    from notify import send
except ImportError:
    send=None

def main():
    raw=os.getenv("SHUYI_AUTH") or os.getenv("sysxc_auth") or os.getenv("sysxc_data") or ""
    accounts=[s.strip() for s in re.split(r"[&@\n]+",raw) if s.strip()]
    if not accounts:
        print("未配置 SHUYI_AUTH，未发送请求")
        return
    today=datetime.datetime.now(ZoneInfo("Asia/Shanghai")).strftime("%Y-%m-%d")
    messages=[]
    for i,auth in enumerate(accounts,1):
        try:
            response=requests.get("https://miniscrm-prod.shuyi.org.cn/saas-gateway/api/agg-trade/v1/signIn/querySignInRecord",params={"i":"1","from":"wxapp"},headers={"auth":auth,"terminal-code":"member_wechat_micro","channel":"wechat_micro","hostname":"scrm-prod.shuyi.org.cn","content-type":"application/json"},timeout=20)
            response.raise_for_status()
            body=response.json()
            if str(body.get("resultCode"))!="0":
                message=f"账号[{i}] 状态查询失败：{body.get('resultCode')} {body.get('resultMsg','')}"
            else:
                data=body.get("data") or {}
                signed=any(str(r.get("createTime","")).startswith(today) and str(r.get("signedTag"))=="1" for r in data.get("records",[]))
                signed=signed or any(str(d).startswith(today) for d in data.get("date",[]))
                message=f"账号[{i}] 今日已签到" if signed else f"账号[{i}] 今日未签到，请打开书亦小程序完成签到及人机验证；本脚本不自动解验证码"
            print(message);messages.append(message)
        except requests.RequestException as e:
            message=f"账号[{i}] 状态查询网络失败：{type(e).__name__}";print(message);messages.append(message)
    if send and any("已签到" not in x for x in messages):send("书亦烧仙草｜需要处理","\n".join(messages))
if __name__=="__main__":main()
