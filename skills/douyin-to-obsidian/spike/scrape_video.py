#!/usr/bin/env python3
"""原子测试：用 Python 爬取一个抖音视频（绕过 a_bogus 签名）。

验证结论：yt-dlp 的抖音提取器算不出 a_bogus 签名（报 "Fresh cookies needed"）。
可行链路 = 无头浏览器现场种 cookie + 渲染出 <video> 真实 CDN 地址，再用 requests 下载。

依赖：gstack 的 browse 二进制（Playwright 无头 Chromium）+ requests。
用法：
    python spike/scrape_video.py "https://v.douyin.com/uR7LtzjZJbw/" /tmp/out.mp4
"""
import json
import subprocess
import sys

import requests

BROWSE = "/Users/mac/.claude/skills/gstack/browse/dist/browse"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def browse(*args):
    return subprocess.run([BROWSE, *args], capture_output=True, text=True).stdout


import re
import time


def get_video_src_and_cookies(share_url):
    """访问视频页：种新鲜 cookie，从网络请求里抓 CDN mp4 地址。

    不依赖 <video>.currentSrc（可能是不可下载的 blob: MSE 流）。改为扫描播放器
    实际发出的 douyinvod.com 媒体请求，取带 __vid= 的渐进式完整文件。
    返回 (视频CDN地址, 真实页面URL, cookies dict)。
    """
    browse("goto", "https://www.douyin.com/")        # 先种 ttwid 等基础 cookie
    browse("goto", share_url)                        # 短链跳到真实视频页并渲染
    page_url = browse("url").strip().splitlines()[-1]
    video_src = ""
    for _ in range(10):                              # 轮询等播放器发出媒体请求
        time.sleep(1.5)
        net = browse("network")
        urls = re.findall(r"https://[^\s\"']*douyinvod[^\s\"']*", net)
        full = [u for u in urls if "mime_type=video_mp4" in u and "__vid=" in u]
        if full:
            video_src = full[0]
            break
    cookies = {c["name"]: c["value"] for c in json.loads(browse("cookies"))}
    return video_src, page_url, cookies


def _safe_cookies(cookies):
    """requests 把 cookie 放进 latin-1 请求头，过滤掉空名和非 latin-1 的值。"""
    safe = {}
    for k, v in cookies.items():
        if not k:
            continue
        try:
            v.encode("latin-1")
        except UnicodeEncodeError:
            continue
        safe[k] = v
    return safe


def download(video_src, cookies, out_path):
    headers = {"User-Agent": UA, "Referer": "https://www.douyin.com/", "Accept": "*/*", "Range": "bytes=0-"}
    r = requests.get(video_src, headers=headers, cookies=_safe_cookies(cookies), stream=True, timeout=60)
    r.raise_for_status()
    total = 0
    with open(out_path, "wb") as f:
        for chunk in r.iter_content(1 << 16):
            f.write(chunk)
            total += len(chunk)
    return total, r.headers.get("content-type", "")


def main():
    share_url = sys.argv[1] if len(sys.argv) > 1 else "https://v.douyin.com/uR7LtzjZJbw/"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "/tmp/dy_test/video_spike.mp4"
    src, page, cookies = get_video_src_and_cookies(share_url)
    if not src:
        print("FAIL: 未能从页面提取到视频地址", file=sys.stderr)
        return 1
    print("page:", page)
    print("video_src:", src[:90], "...")
    print("cookies:", sorted(cookies))
    n, ctype = download(src, cookies, out_path)
    print(f"OK: 下载 {n} 字节, content-type={ctype} -> {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
