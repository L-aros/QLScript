// Standardized variables; legacy names remain compatible.
if (process.env.CMCC_SESSION_TOKENS) process.env.chinaMobile = process.env.CMCC_SESSION_TOKENS;
/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  中国移动APP签到
cron: 30 7 * * *
------------------------------------------
#Notice:   
变量名:CMCC_SESSION_TOKENS
变量值:https://wx.10086.cn/qwhdhub/api/抓COOKIE中的QWHD_SESSION_TOKEN的值，多个账号用&或者换行分隔
⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const { Env } = require("../tools/env")
const $ = new Env("中国移动APP");
let ckName = `chinaMobile`;
const strSplitor = "#";
const axios = require("axios").create({timeout:20000});
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0].trim();

    }

    async run() {

        await this.signIn()
    }

    async signIn() {
        let toDay = $.time("yyyyMMdd");
        let options = {
            method: 'POST',
            url: 'https://wx.10086.cn/qwhdhub/api/mark/mark31/domark',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_15 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/wkwebview leadeon/12.0.9/CMCCIT',
                'x-requested-with': 'XMLHttpRequest',
                'Sec-Fetch-Site': 'same-origin',
                'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
                'Sec-Fetch-Mode': 'cors',
                'Content-Type': 'application/json;charset=UTF-8',
                'Origin': 'https://wx.10086.cn',
                'Referer': 'https://wx.10086.cn/qwhdhub/qwhdmark/1021122301',
                'login-check': '1',
                'Sec-Fetch-Dest': 'empty',
                'Cookie': "QWHD_SESSION_TOKEN=" + this.token,
            },
            data: JSON.stringify({
                "date": toDay
            })
        };
        const {data: status} = await axios.post("https://wx.10086.cn/qwhdhub/api/mark/mark31/markstatus",{}, {headers:options.headers});
        if (status.code!=="SUCCESS" || !Array.isArray(status.data?.markstatus)) throw new Error("签到状态查询失败，业务码="+status.code);
        const day=status.data.markstatus.find(x=>x.date===toDay);
        if (!day || !["0","1"].includes(String(day.status))) throw new Error("当天签到状态异常，停止提交");
        if (String(day.status)==="1") { $.log(`账号[${this.index}] 今日已签到，无需重复提交`); return; }
        if (process.env.CMCC_READ_ONLY === "1") { $.log("今日未签到（只读检查，未提交）");return; }
        let { data: result } = await axios.request(options);
        if (result?.code == 'SUCCESS') {
            //打印签到结果
            $.log(`🌸账号[${this.index}]` + `🕊签到成功🎉`);
        } else {
            $.log(`🌸账号[${this.index}] 签到-失败:${result.msg}❌`)
        }




    }








}

!(async () => {
    // Removed unrelated remote announcement request.
    $.checkEnv(ckName);

    for (let user of $.userList) {
        try { await new Task(user).run(); } catch(e) { $.log(`账号执行失败：${e.response ? "HTTP " + e.response.status : e.code || e.message}`); }
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
	try {
		let options = {
			url: `https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json`,
			headers: {
				"User-Agent": defaultUserAgent,
			},
            timeout:3000
		}
		let {
			data: res
		} = await axios.request(options);
		$.log(res)
		return res
	} catch (e) {}

}
