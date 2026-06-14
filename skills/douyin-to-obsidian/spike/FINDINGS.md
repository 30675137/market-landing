# 抖音视频爬取 — 原子测试结论（2026-06-07）

测试链接：`https://v.douyin.com/uR7LtzjZJbw/`（中国工业相关，id `7618147753437250550`）

## 结论
✅ Python 可以稳定爬取抖音视频。产物：90.5 MB，`video/mp4`，时长 423s，可复现。
运行：`.venv/bin/python spike/scrape_video.py "<分享链接>" <输出.mp4>`

## 行不通的路（已实测）
- **yt-dlp**：报 `Fresh cookies (not necessarily logged in) are needed`。
  - 从 Chrome/Firefox 读 cookie（`--cookies-from-browser`）→ 仍失败。
  - 用无头浏览器现场种的 `ttwid`/`__ac_nonce`/`__ac_signature` 写成 cookies.txt → 仍失败。
  - 根因：抖音 API 需要 `a_bogus` 签名，yt-dlp 抖音提取器当前算不出。
- **`<video>.currentSrc`**：不稳，有时返回 `blob:`（MSE 流），不可直接下载。

## 行得通的路（最终方案）
1. 无头浏览器（gstack browse / Playwright）先 `goto douyin.com` 种基础 cookie；
2. `goto` 分享链接，短链自动跳到真实视频页并渲染、播放；
3. 轮询 `network`，抓播放器实际发出的 `douyinvod.com` 媒体请求，
   取带 `mime_type=video_mp4` 且 `__vid=` 的渐进式完整文件地址；
4. `requests.get` 带 `Referer: https://www.douyin.com/` + 桌面 UA + cookie 下载。
   - 注意：cookie 值里有非 latin-1 字符（如 em dash），发请求前要过滤，否则 `UnicodeEncodeError`。

## 对实现计划的影响
plan 里的 `downloader`（基于 yt-dlp）**需要改**为「无头浏览器抓 CDN 地址 + requests 下载」。
`VideoMeta` 契约不变；元数据（title/author/publish_date）可从页面 `#RENDER_DATA`
（URL 编码 JSON，含完整 aweme 详情）解析——很可能连字幕/caption 数据都在里面，待验证。
