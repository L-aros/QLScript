// Standardized variables; legacy names remain compatible.
if (process.env.TASTIN_TOKEN) process.env.tasiting = process.env.TASTIN_TOKEN;
/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  塔斯汀小程序签到
cron: 30 8 * * *
------------------------------------------
#Notice:   
抓包小程序塔斯汀，获取https://sss-web.tastientech.com/api 请求头的user-token参数，填入环境变量，格式如下：
变量名：TASTIN_TOKEN
多账号使用&分割或者换行
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
const $ = new Env("塔斯汀小程序签到");
let ckName = `tasiting`;
const strSplitor = "#";
const axios = require("axios").create({ timeout: 20000 });
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
    constructor(env) {
        this.index = $.userIdx++
        this.user = env.split(strSplitor);
        this.token = this.user[0].trim();
        this.userFlag = false
        this.phone = ''

    }

    async run() {

        await this.userInfo()
        if (this.userFlag) {
            await this.getSignInfo()
            if (!this.activityId) throw new Error("未找到当前签到活动，停止执行");
            if (this.activityId) {
                await this.getUserSignInfo()

            }
        }
    }
    async userInfo() {
        let options = {
            method: 'GET',
            url: `https://sss-web.tastientech.com/api/intelligence/member/getMemberDetail`,
            headers:
                { 'user-token': this.token, 'version': process.env.TASTIN_CLIENT_VERSION || '3.88.3', 'channel': '1' }


        };
        let { data: result } = await axios.request(options);

        if (result?.code == '200') {
            //打印签到结果
            this.userFlag = true
            this.phone = result.result.phone
            $.log(`🌸账号[${this.index}]手机号：[${String(result.result.phone || "").replace(/^(\d{3})\d+(\d{4})$/, "$1****$2")}]`);
        } else {
            $.log(`🌸账号[${this.index}] 查询-失败:${JSON.stringify(result)}❌`)
        }




    }
    async getSignInfo() {
        let options = {
            method: 'POST',
            url: `https://sss-web.tastientech.com/api/minic/shop/intelligence/banner/c/list`,
            headers: { 'user-token': this.token, 'version': process.env.TASTIN_CLIENT_VERSION || '3.88.3', 'channel': '1' },
            data: { "shopId": "", "birthday": "", "gender": 0, "nickName": '', "phone": "" }

        };
        let { data: result } = await axios.request(options);
        if (String(result?.code) !== "200" || !Array.isArray(result.result)) throw new Error(`活动查询失败，业务码=${result?.code ?? "未知"}`);
        for (let item of result.result) {
            if (item.jumpCode == 'SIGN') {
                this.activityId = (typeof item.jumpPara === "string" ? JSON.parse(item.jumpPara) : item.jumpPara)?.activityId
                $.log(`🌸账号[${this.index}] 活动ID：[${this.activityId}]`);
            }
        }
    }
    async getUserSignInfo() {
        let options = {
            method: 'POST',
            url: `https://sss-web.tastientech.com/api/sign/member/signInfoV2`,
            headers: { 'user-token': this.token, 'version': process.env.TASTIN_CLIENT_VERSION || '3.88.3', 'channel': '1' },
            data: { activityId: this.activityId }

        };
        let { data: result } = await axios.request(options);
        if (result?.code == '200') {
            if (!result.result?.signMemberInfo || typeof result.result.signMemberInfo.todaySign !== "boolean") throw new Error("签到状态结构异常，已停止提交");
            if (result.result.signMemberInfo.todaySign !== true) {
                if (process.env.TASTIN_READ_ONLY === "1") $.log("今日未签到（只读检查，未提交）"); else await this.doSign()
            } else {
                $.log(`🌸账号[${this.index}] 今日已签到🎉`);
            }
        }
    }
    async doSign() {
        let options = {
            method: 'POST',
            url: `https://sss-web.tastientech.com/api/sign/member/signV2/sign`,
            headers: { 'user-token': this.token, 'version': process.env.TASTIN_CLIENT_VERSION || '3.88.3', 'channel': '1' },
            data: { "activityId": this.activityId, "memberName": "", "memberPhone": this.phone }

        };
        let { data: result } = await axios.request(options);
        if (result?.code == '200') {
            //打印签到结果
            $.log(`🌸账号[${this.index}]` + `签到成功🎉`);
        } else {
            $.log(`🌸账号[${this.index}] 签到-失败:${JSON.stringify(result)}❌`)
        }




    }








}

!(async () => {
    // Removed unrelated remote announcement request.
    $.checkEnv(ckName);

    for (let user of $.userList) {
        try { await new Task(user).run(); } catch (e) { $.log(`账号执行失败：${e.response ? "HTTP " + e.response.status : e.code || e.message}`); }
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