# 设计文档：douyin-to-obsidian skill

- 日期：2026-06-07
- 作者：Randy（与 Claude 共同 brainstorm）
- 状态：已批准设计，待写实现计划

## 1. 目标

一个 Claude Code agent skill：把抖音视频转成文字字幕，写入 Obsidian vault。
输入是「博主主页链接」（批量拉该博主视频）或「一个/多个视频分享链接」（逐个处理）；
输出是每个视频一个 Markdown 文件（带 frontmatter + 转写全文）。

非目标（YAGNI，明确不做）：
- 抖音关键词/话题搜索（反爬极重、`f2` 支持不稳）。
- AI 总结/翻译/打标签（先只做「转文字 + 落地」，后续可加）。
- 烧录字幕 OCR（覆盖率低、错字多）。

## 2. 背景与选型结论

抖音绝大多数视频没有可下载的字幕文件，屏幕上的字拿不到。转文本只能靠语音转写（ASR）。

调研后放弃的路线：
- **Get笔记（biji.com）OpenAPI**：实测 403 `not_member`，仅会员可用，且依赖外部服务。
- 云 ASR：快但按量付费、需上传音频。
- 烧录字幕 OCR：仅适用于硬字幕，错字多。

选定路线：**本地 ASR 管道**，无会员墙、全本地、隐私可控。

运行环境（已探明，本机）：
- Intel Mac（x86_64）。`mlx-whisper`（Apple Silicon 专用）不可用。
- `ffmpeg` 已装；`brew`、Python 3.11.15 在位；`yt-dlp`/`f2`/whisper 未装。

工具选型：
- 下载器：`f2`（抖音专用，支持博主主页批量 + cookie），`yt-dlp` 作为单视频链接兜底。
- 转写：`faster-whisper`（CTranslate2，CPU），中文默认 `small` 模型，可配置升到 `medium`/`large-v3`。

## 3. 架构

```
输入(主页URL | 视频链接[])
   └─> urls.classify()          # 判别主页 vs 视频，短链 v.douyin.com 解析
        └─> downloader          # f2(批量) / yt-dlp(单链) 下音频 + 元数据
             └─> 对每条视频:
                  vault.exists(aweme_id)?
                    ├ 是 -> 跳过(除非 --force)
                    └ 否 -> transcribe(faster-whisper) -> render(md) -> vault.write
   └─> 打印汇总(新增 / 跳过 / 失败)
```

### 组件（每个单一职责，可独立测试）

| 文件 | 职责 | 依赖 |
|---|---|---|
| `SKILL.md` | 触发词、用法、首次安装引导、配置说明 | — |
| `scripts/sync.py` | CLI 入口 + 编排流程、汇总输出 | 下列各模块 |
| `scripts/urls.py` | 输入分类（主页/视频）、短链解析、URL 归一化 | requests |
| `scripts/downloader.py` | 封装 f2/yt-dlp，产出视频元数据 + 音频文件路径 | f2, yt-dlp |
| `scripts/transcribe.py` | faster-whisper 封装，音频 -> 文本 | faster-whisper |
| `scripts/render.py` | 生成 frontmatter + 正文、文件名清洗 | — |
| `scripts/vault.py` | 去重判断、写入/跳过 | — |
| `scripts/config.py` | 读环境变量、缺失时给明确报错 | — |
| `requirements.txt` | f2 / yt-dlp / faster-whisper 版本锁定 | — |
| `tests/` | pytest 单测（mock 下载与 ASR） | pytest |

### 数据契约（视频元数据对象）

`downloader` 对每个视频返回：
```python
{
  "aweme_id": str,        # 视频唯一 id，用于去重和文件名
  "title": str,           # 视频文案/标题
  "author": str,          # 博主昵称
  "url": str,             # 视频规范链接
  "publish_date": str,    # YYYY-MM-DD
  "duration": float,      # 秒
  "audio_path": str,      # 本地下载的音频文件路径
}
```

`transcribe(audio_path) -> str`：返回纯文本转写（段落用换行分隔）。

## 4. 配置（环境变量，均不入库）

| 变量 | 默认 | 说明 |
|---|---|---|
| `DOUYIN_OBSIDIAN_VAULT` | `/Volumes/macpro_data/Development/myWorkSpece/knowledge/Randy的第二大脑` | vault 根目录 |
| `DOUYIN_SUBDIR` | `抖音字幕` | vault 下落地子目录 |
| `WHISPER_MODEL` | `small` | faster-whisper 模型大小 |
| `WHISPER_LANG` | `zh` | 转写语言 |
| `DOUYIN_COOKIE` | （空） | f2 抖音 cookie，批量拉主页时可能需要 |

CLI 参数：`--force`（强制重转）、`--limit N`（主页最多拉 N 个）、`--vault`、`--subdir`、`--model`。

## 5. 输出格式

路径：`<vault>/<subdir>/<安全标题>-<aweme_id>.md`

```markdown
---
title: "视频文案前若干字"
author: "博主昵称"
source: douyin
video_url: "https://www.douyin.com/video/xxxx"
aweme_id: "xxxx"
publish_date: 2026-06-01
duration: 73
transcribed_with: "faster-whisper/small"
synced: 2026-06-07
tags: [抖音, 字幕]
---

<转写全文>
```

去重：按 `aweme_id`（文件名后缀）。**已存在则跳过**，`--force` 才重转。

## 6. 错误处理

- 缺工具（f2/yt-dlp/faster-whisper）：打印明确的安装命令引导，不静默失败。
- vault 路径不存在：明确报错并提示设置 `DOUYIN_OBSIDIAN_VAULT`。
- 下载失败（私密/地区限制/需登录）：跳过该条并记入失败汇总，提示可设 `DOUYIN_COOKIE`。
- 转写为空（纯音乐/无人声）：写入 md 但正文标注「（无可识别语音）」。
- 短链解析失败：报错并回显原始链接。
- 文件名清洗：去除 `/ \ : * ? " < > |` 和换行，超长截断。

## 7. 测试策略（TDD）

单元测试（不触网络、不跑 CPU 转写，全部 mock）：
- `urls.classify`：主页 URL、视频 URL、短链分别识别正确。
- `render`：给定元数据 + 转写文本，frontmatter 字段与正文正确；特殊字符标题文件名清洗正确。
- `vault`：已存在 aweme_id 跳过；`--force` 时覆盖；新 id 写入。
- `downloader`：mock f2/yt-dlp 输出，验证元数据解析成契约结构。
- `config`：缺失必填项时抛出带指引的错误。

手动冒烟测试（文档记录，不进 CI）：用一个真实公开博主主页 + 一个视频链接各跑一次，核对 vault 产物。

## 8. 首次运行引导（bootstrap）

`SKILL.md` 指示：检测缺失依赖时，提示并（经用户确认后）执行：
```bash
python3 -m pip install -r requirements.txt   # f2 yt-dlp faster-whisper
# ffmpeg 已装；如缺：brew install ffmpeg
```
首次转写会自动下载 whisper 模型权重（small 约几百 MB），提示用户耐心等待。

## 9. 安全

- 凭证/cookie 只走环境变量，绝不写入仓库或 md。
- 此前对话中暴露过的 Get笔记 API Key 已不再使用，建议用户后台重置。
