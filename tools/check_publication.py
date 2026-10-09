#!/usr/bin/env python3
"""Scan the Git index before publication without printing matched credentials."""
import json
import re
import subprocess
import sys
from pathlib import PurePosixPath

RULES = {
    "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "github_token": re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b"),
    "telegram_token": re.compile(r"\b\d{8,12}:[A-Za-z0-9_-]{30,}\b"),
    "wechat_openid": re.compile(r"(?<![A-Za-z0-9])[oO][A-Za-z0-9_-]{27}(?![A-Za-z0-9])"),
    "phone_number": re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)"),
    "hardcoded_secret": re.compile(r'''(?i)\b(?:CLIENT_SECRET|privateKeyString|secretKey|AES_KEY_HEX|AES_IV_HEX|SIGN_PREFIX|login_token|phpsessid)\s*=\s*["'`]([^"'`\r\n]{8,})["'`]'''),
}

def git(*args):
    return subprocess.check_output(["git", *args])

def main():
    names = [n.decode("utf-8") for n in git("ls-files", "--cached", "-z").split(b"\0") if n]
    if not names:
        print("No staged/tracked files to scan", file=sys.stderr)
        return 2
    findings = []
    for name in names:
        p = PurePosixPath(name)
        blocked = (
            p.parts[0] in ("analysis", ".private")
            or name == "daily/kuaishou.js"
            or "__pycache__" in p.parts
            or "node_modules" in p.parts
            or (p.name.startswith(".env") and p.name != ".env.example")
            or "token_cache" in p.name
            or p.name.startswith("pdd-cache-")
            or p.suffix.lower() in (".pyc", ".log", ".pem", ".key", ".pfx", ".p12")
        )
        if blocked:
            findings.append({"path": name, "rule": "private_artifact"})
        data = git("show", ":" + name)
        if b"\0" in data:
            findings.append({"path": name, "rule": "unreviewed_binary"})
            continue
        source = data.decode("utf-8-sig", errors="replace")
        for rule, pattern in RULES.items():
            for match in pattern.finditer(source):
                findings.append({"path": name, "line": source.count("\n", 0, match.start()) + 1, "rule": rule})
    print(json.dumps({"scope": "Git index", "files_scanned": len(names), "findings": findings}, ensure_ascii=False, indent=2))
    return 1 if findings else 0

if __name__ == "__main__":
    sys.exit(main())
