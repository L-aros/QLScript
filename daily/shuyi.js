// 共用 Python 状态检查，避免重复保留旧验证码识别流程。
const {spawnSync}=require("child_process");
const path=require("path");
const r=spawnSync("python3",[path.join(__dirname,"shuyi.py")],{stdio:"inherit",env:process.env});
if(r.error){console.error(r.error.message);process.exit(1);}process.exit(r.status ?? 1);
