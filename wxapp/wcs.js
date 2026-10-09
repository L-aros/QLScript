const axios = require("axios");
class WeChatCodeServer {
    constructor(options) {
        this.serverUrl = options.url;
        this.appid = options.appid;
        this.auth = options.auth;
    }
    getCode(openid) {
        console.log('等待获取code:');
        return new Promise((resolve, reject) => {
            axios.post(this.serverUrl + '/wx/code', { app_id: this.appid, ref: String(openid).trim() }, {
                headers: {
                    Authorization: `Bearer ${this.auth}`
                },
                timeout: 30 * 1000
            }).then(res => {
                console.log('获取code成功:');
                resolve(res);
            }).catch(err => {
                console.log("微信接口失败:", err.response?.status, err.response?.data || err.message);
                reject(err);
            });
        });
    }
   
    cloudInit(openid) {
        console.log('等待云函数初始化:');
        return new Promise((resolve, reject) => {
            axios.post(this.serverUrl + '/wx/call/init', { appid: this.appid, openid }, {
                headers: {
                    'auth': this.auth
                },
                timeout: 30 * 1000
            }).then(res => {
                console.log('云函数初始化成功:');
                resolve(res);
            }).catch(err => {
                console.log("微信接口失败:", err.response?.status, err.response?.data || err.message);
                reject(err);
            });
        });
    }
    cloudCall(openid) {
        console.log('等待云函数调用:');
        return new Promise((resolve, reject) => {
            axios.post(this.serverUrl + '/wx/cloud/call', { appid: this.appid, openid }, {
                headers: {
                    'auth': this.auth
                },
                timeout: 30 * 1000
            }).then(res => {
                console.log('云函数调用成功:');
                resolve(res);
            }).catch(err => {
                console.log("微信接口失败:", err.response?.status, err.response?.data || err.message);
                reject(err);
            });
        });
    }
}
module.exports = WeChatCodeServer;