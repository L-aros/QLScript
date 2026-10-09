# 青龙脚本仓库

用于青龙面板的日常签到与微信小程序任务集合。

## 目录

- `daily/`：日常签到、奖励任务及状态检查。
- `wxapp/`：微信小程序业务脚本与协议服务封装。
- `tools/`：公共运行工具、通知组件及发布前检查。
- `notify.py` / `sendNotify.js`：通知模块。

仅调度业务脚本，不要调度通知模块、`env.js`、`yyb_compat.js`、`wcs.js` 或 `check_publication.py`。

## 配置

参考 `.env.example`，在青龙面板的环境变量页按需要填写账号和凭据。示例中的凭据均为空；脚本不会自动加载 `.env` 文件。各脚本文件头包含业务变量及 cron 说明。

微信协议业务使用 `YYB_SERVER_URL`、`YYB_PROTOCOL_TOKEN`；服务默认地址 `http://yyb-go:8000` 是容器服务名，不是可用的公开服务。

脱敏后的以下业务需要额外配置，不再提供内置密钥：

| 业务 | 环境变量 |
| --- | --- |
| 蜜雪冰城 RSA 签名 | `MIXUE_RSA_PRIVATE_KEY`，支持真实换行或字面量 `\n` |
| 影视飓风登录 | `MEDIASTORM_CLIENT_SECRET` |
| 得物 / 得物星愿签名 | `DEWU_SIGN_SECRET` |
| 得物解密回落 | `DEWU_DECRYPT_SEED` |
| 名创优品加密签名 | `MINISO_AES_KEY_HEX`、`MINISO_AES_IV_HEX`、`MINISO_SIGN_PREFIX` |

Python 业务通常依赖 `requests`；51 代理另需 `beautifulsoup4`。JavaScript 依赖因脚本而异，请结合 `require(...)` 在青龙中安装。未进行线上接口或全业务运行验证。

## 公开范围

Token / Cookie 缓存、备份、日志、Python 字节码及本地环境文件不纳入 Git。快手混淆脚本和 `analysis/` 解混淆产物暂不公开，待完整敏感信息及行为审查后再决定发布。

提交前检查暂存内容：

```sh
python tools/check_publication.py
```

检查使用启发式规则，不能证明完全不存在敏感信息。详见 `PUBLICATION_REVIEW.md`。

## 来源与许可

保留已有源码中的作者及来源标注。本次未添加统一许可证；第三方脚本的再分发许可仍需逐项核实，不应将整个集合默认视为 MIT 授权。
