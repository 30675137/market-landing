# douyin-to-obsidian Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一个 Claude Code skill，用 Python 爬取抖音视频（博主主页批量 / 视频链接），用 faster-whisper 本地转写为文字，每个视频写一个带 frontmatter 的 Markdown 到 Obsidian vault。

**Architecture:** 管道式：`urls.classify` 判别输入 → `downloader` 用 yt-dlp 探测元数据并下载音频（产出统一的 `VideoMeta`）→ 已存在则跳过，否则 `transcribe`（faster-whisper）→ `render` 成 Markdown → `vault` 写入。所有外部副作用（subprocess、ASR 模型、网络）通过注入的 runner/loader 解耦，便于单测全部 mock。

**Tech Stack:** Python 3.11，yt-dlp（下载+元数据），faster-whisper（CPU 转写），ffmpeg（已装），pytest（测试）。

**Base dir:** `/Users/mac/.claude/skills/douyin-to-obsidian/`（下文所有相对路径以此为根）。

---

## File Structure

| 文件 | 职责 |
|---|---|
| `scripts/models.py` | `VideoMeta` 数据契约（dataclass） |
| `scripts/config.py` | 读环境变量 -> `Config`；缺失/路径不存在时抛 `ConfigError` |
| `scripts/urls.py` | 输入分类（homepage/video/unknown）、短链解析 |
| `scripts/render.py` | 文件名清洗、frontmatter + 正文渲染 |
| `scripts/vault.py` | 目标路径、跳过判断、写入 |
| `scripts/downloader.py` | yt-dlp 封装：列视频 + 下音频 -> `VideoMeta` |
| `scripts/transcribe.py` | faster-whisper 封装：音频 -> 文本 |
| `scripts/sync.py` | CLI 入口 + 编排 + 汇总 |
| `tests/test_*.py` | 各模块单测 |
| `requirements.txt` | yt-dlp / faster-whisper |
| `pytest.ini` | pytest 配置 |
| `SKILL.md` | 触发词、用法、安装引导、配置说明 |

---

## Task 0: 脚手架与仓库初始化

**Files:**
- Create: `/Users/mac/.claude/skills/douyin-to-obsidian/requirements.txt`
- Create: `/Users/mac/.claude/skills/douyin-to-obsidian/pytest.ini`
- Create: `/Users/mac/.claude/skills/douyin-to-obsidian/.gitignore`
- Create: `/Users/mac/.claude/skills/douyin-to-obsidian/scripts/__init__.py`（空）
- Create: `/Users/mac/.claude/skills/douyin-to-obsidian/tests/__init__.py`（空）

- [ ] **Step 1: 建目录与 git 仓库**

```bash
mkdir -p /Users/mac/.claude/skills/douyin-to-obsidian/scripts
mkdir -p /Users/mac/.claude/skills/douyin-to-obsidian/tests
cd /Users/mac/.claude/skills/douyin-to-obsidian && git init
```

- [ ] **Step 2: 写 requirements.txt**

```
yt-dlp>=2025.1.1
faster-whisper>=1.1.0
```

- [ ] **Step 3: 写 pytest.ini**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
addopts = -q
```

- [ ] **Step 4: 写 .gitignore**

```
__pycache__/
*.pyc
.venv/
*.mp3
*.m4a
```

- [ ] **Step 5: 建空包文件**

`scripts/__init__.py` 和 `tests/__init__.py` 都写空内容（0 字节）。

- [ ] **Step 6: 建虚拟环境并装 pytest（先只装测试依赖，重依赖延后到冒烟测试）**

```bash
cd /Users/mac/.claude/skills/douyin-to-obsidian
python3 -m venv .venv && .venv/bin/pip install -U pip pytest
```

- [ ] **Step 7: 提交**

```bash
cd /Users/mac/.claude/skills/douyin-to-obsidian
git add requirements.txt pytest.ini .gitignore scripts/__init__.py tests/__init__.py
git commit -m "chore: scaffold douyin-to-obsidian skill"
```

---

## Task 1: VideoMeta 数据契约

**Files:**
- Create: `scripts/models.py`
- Test: `tests/test_models.py`

- [ ] **Step 1: 写失败测试**

```python
# tests/test_models.py
from scripts.models import VideoMeta


def test_videometa_holds_fields():
    m = VideoMeta(
        aweme_id="123",
        title="标题",
        author="博主",
        url="https://www.douyin.com/video/123",
        publish_date="2026-06-01",
        duration=12.5,
        audio_path="",
    )
    assert m.aweme_id == "123"
    assert m.duration == 12.5
    assert m.audio_path == ""
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /Users/mac/.claude/skills/douyin-to-obsidian && .venv/bin/pytest tests/test_models.py -v`
Expected: FAIL，`ModuleNotFoundError: No module named 'scripts.models'`

- [ ] **Step 3: 实现 models.py**

```python
# scripts/models.py
from dataclasses import dataclass


@dataclass
class VideoMeta:
    aweme_id: str
    title: str
    author: str
    url: str
    publish_date: str  # YYYY-MM-DD，未知为空串
    duration: float    # 秒
    audio_path: str    # 本地音频路径，未下载为空串
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_models.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add scripts/models.py tests/test_models.py
git commit -m "feat: add VideoMeta data contract"
```

---

## Task 2: config 配置加载

**Files:**
- Create: `scripts/config.py`
- Test: `tests/test_config.py`

- [ ] **Step 1: 写失败测试**

```python
# tests/test_config.py
import pytest
from scripts.config import load_config, Config, ConfigError


def test_load_config_uses_defaults(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    cfg = load_config(env={"DOUYIN_OBSIDIAN_VAULT": str(vault)})
    assert isinstance(cfg, Config)
    assert cfg.vault_path == str(vault)
    assert cfg.subdir == "抖音字幕"
    assert cfg.model == "small"
    assert cfg.lang == "zh"
    assert cfg.cookie == ""


def test_load_config_overrides(tmp_path):
    vault = tmp_path / "v"
    vault.mkdir()
    cfg = load_config(env={
        "DOUYIN_OBSIDIAN_VAULT": str(vault),
        "DOUYIN_SUBDIR": "x",
        "WHISPER_MODEL": "medium",
        "WHISPER_LANG": "en",
        "DOUYIN_COOKIE": "abc",
    })
    assert (cfg.subdir, cfg.model, cfg.lang, cfg.cookie) == ("x", "medium", "en", "abc")


def test_load_config_missing_vault_raises(tmp_path):
    missing = tmp_path / "nope"
    with pytest.raises(ConfigError) as e:
        load_config(env={"DOUYIN_OBSIDIAN_VAULT": str(missing)})
    assert "DOUYIN_OBSIDIAN_VAULT" in str(e.value)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_config.py -v`
Expected: FAIL，`No module named 'scripts.config'`

- [ ] **Step 3: 实现 config.py**

```python
# scripts/config.py
import os
from dataclasses import dataclass

DEFAULT_VAULT = "/Volumes/macpro_data/Development/myWorkSpece/knowledge/Randy的第二大脑"


class ConfigError(Exception):
    pass


@dataclass
class Config:
    vault_path: str
    subdir: str
    model: str
    lang: str
    cookie: str


def load_config(env=None):
    env = os.environ if env is None else env
    vault = env.get("DOUYIN_OBSIDIAN_VAULT", DEFAULT_VAULT)
    if not os.path.isdir(vault):
        raise ConfigError(
            f"vault 目录不存在: {vault}。请设置环境变量 DOUYIN_OBSIDIAN_VAULT 指向你的 Obsidian vault。"
        )
    return Config(
        vault_path=vault,
        subdir=env.get("DOUYIN_SUBDIR", "抖音字幕"),
        model=env.get("WHISPER_MODEL", "small"),
        lang=env.get("WHISPER_LANG", "zh"),
        cookie=env.get("DOUYIN_COOKIE", ""),
    )
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_config.py -v`
Expected: PASS（3 passed）

- [ ] **Step 5: 提交**

```bash
git add scripts/config.py tests/test_config.py
git commit -m "feat: add config loader with env + defaults"
```

---

## Task 3: urls 输入分类与短链解析

**Files:**
- Create: `scripts/urls.py`
- Test: `tests/test_urls.py`

- [ ] **Step 1: 写失败测试**

```python
# tests/test_urls.py
from scripts.urls import classify, resolve_short_link


def test_classify_homepage():
    assert classify("https://www.douyin.com/user/MS4wLjABAAAA") == "homepage"


def test_classify_video():
    assert classify("https://www.douyin.com/video/7412345678901234567") == "video"


def test_classify_short_link():
    assert classify("https://v.douyin.com/abcDEF/") == "short"


def test_classify_unknown():
    assert classify("https://example.com/foo") == "unknown"


def test_resolve_short_link_follows_redirect():
    def fake_head(url, **kw):
        class R:
            headers = {"Location": "https://www.douyin.com/video/777"}
            url = "https://www.douyin.com/video/777"
        return R()
    out = resolve_short_link("https://v.douyin.com/abc/", fetch=fake_head)
    assert out == "https://www.douyin.com/video/777"
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_urls.py -v`
Expected: FAIL，`No module named 'scripts.urls'`

- [ ] **Step 3: 实现 urls.py**

```python
# scripts/urls.py
import re

_USER = re.compile(r"douyin\.com/user/", re.I)
_VIDEO = re.compile(r"douyin\.com/video/\d+", re.I)
_SHORT = re.compile(r"v\.douyin\.com/", re.I)


def classify(url):
    if _SHORT.search(url):
        return "short"
    if _VIDEO.search(url):
        return "video"
    if _USER.search(url):
        return "homepage"
    return "unknown"


def resolve_short_link(url, fetch=None):
    """解析 v.douyin.com 短链到真实 URL。fetch 注入以便测试。"""
    if fetch is None:
        import requests
        fetch = lambda u, **kw: requests.head(u, allow_redirects=True, timeout=10)
    resp = fetch(url, allow_redirects=True)
    return getattr(resp, "url", None) or resp.headers.get("Location", url)
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_urls.py -v`
Expected: PASS（5 passed）

- [ ] **Step 5: 提交**

```bash
git add scripts/urls.py tests/test_urls.py
git commit -m "feat: add URL classification and short-link resolution"
```

---

## Task 4: render 渲染与文件名清洗

**Files:**
- Create: `scripts/render.py`
- Test: `tests/test_render.py`

- [ ] **Step 1: 写失败测试**

```python
# tests/test_render.py
from scripts.models import VideoMeta
from scripts.render import sanitize_filename, output_filename, render_markdown


def _meta():
    return VideoMeta(
        aweme_id="777",
        title="如何做 AI/创业: 第一课?",
        author="某博主",
        url="https://www.douyin.com/video/777",
        publish_date="2026-06-01",
        duration=73.0,
        audio_path="/tmp/777.mp3",
    )


def test_sanitize_removes_illegal_chars():
    assert sanitize_filename('a/b:c*d?e"f<g>h|i\nj') == "abcdefghij"


def test_sanitize_truncates_long_names():
    assert len(sanitize_filename("标" * 200)) <= 80


def test_output_filename_has_id_suffix():
    assert output_filename(_meta()) == "如何做 AI创业 第一课-777.md"


def test_render_markdown_has_frontmatter_and_body():
    md = render_markdown(_meta(), "这是转写正文。", model="small", synced_date="2026-06-07")
    assert md.startswith("---\n")
    assert 'aweme_id: "777"' in md
    assert "source: douyin" in md
    assert 'transcribed_with: "faster-whisper/small"' in md
    assert "synced: 2026-06-07" in md
    assert md.rstrip().endswith("这是转写正文。")


def test_render_markdown_empty_transcript_placeholder():
    md = render_markdown(_meta(), "", model="small", synced_date="2026-06-07")
    assert "（无可识别语音）" in md
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_render.py -v`
Expected: FAIL，`No module named 'scripts.render'`

- [ ] **Step 3: 实现 render.py**

```python
# scripts/render.py
import re

_ILLEGAL = re.compile(r'[/\\:*?"<>|\n\r\t]')
_MAX = 80


def sanitize_filename(name):
    cleaned = _ILLEGAL.sub("", name).strip()
    return cleaned[:_MAX]


def output_filename(meta):
    return f"{sanitize_filename(meta.title)}-{meta.aweme_id}.md"


def render_markdown(meta, transcript, model, synced_date):
    body = transcript.strip() or "（无可识别语音）"
    title = meta.title.replace('"', "'")
    fm = [
        "---",
        f'title: "{title}"',
        f'author: "{meta.author}"',
        "source: douyin",
        f'video_url: "{meta.url}"',
        f'aweme_id: "{meta.aweme_id}"',
        f"publish_date: {meta.publish_date}",
        f"duration: {int(meta.duration)}",
        f'transcribed_with: "faster-whisper/{model}"',
        f"synced: {synced_date}",
        "tags: [抖音, 字幕]",
        "---",
        "",
    ]
    return "\n".join(fm) + body + "\n"
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_render.py -v`
Expected: PASS（5 passed）

- [ ] **Step 5: 提交**

```bash
git add scripts/render.py tests/test_render.py
git commit -m "feat: add markdown rendering and filename sanitization"
```

---

## Task 5: vault 写入与去重

**Files:**
- Create: `scripts/vault.py`
- Test: `tests/test_vault.py`

- [ ] **Step 1: 写失败测试**

```python
# tests/test_vault.py
from pathlib import Path
from scripts.models import VideoMeta
from scripts.vault import target_path, should_skip, write_note


def _meta():
    return VideoMeta("777", "标题", "博主", "u", "2026-06-01", 1.0, "")


def test_target_path_joins_vault_subdir(tmp_path):
    p = target_path(str(tmp_path), "抖音字幕", _meta())
    assert p == tmp_path / "抖音字幕" / "标题-777.md"


def test_should_skip_true_when_exists_and_not_force(tmp_path):
    p = tmp_path / "n.md"
    p.write_text("x")
    assert should_skip(p, force=False) is True


def test_should_skip_false_when_force(tmp_path):
    p = tmp_path / "n.md"
    p.write_text("x")
    assert should_skip(p, force=True) is False


def test_should_skip_false_when_missing(tmp_path):
    assert should_skip(tmp_path / "nope.md", force=False) is False


def test_write_note_creates_parent_and_file(tmp_path):
    p = tmp_path / "sub" / "n.md"
    write_note(p, "hello")
    assert p.read_text() == "hello"
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_vault.py -v`
Expected: FAIL，`No module named 'scripts.vault'`

- [ ] **Step 3: 实现 vault.py**

```python
# scripts/vault.py
from pathlib import Path
from scripts.render import output_filename


def target_path(vault_path, subdir, meta):
    return Path(vault_path) / subdir / output_filename(meta)


def should_skip(path, force):
    return Path(path).exists() and not force


def write_note(path, content):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_vault.py -v`
Expected: PASS（5 passed）

- [ ] **Step 5: 提交**

```bash
git add scripts/vault.py tests/test_vault.py
git commit -m "feat: add vault write and dedup logic"
```

---

## Task 6: downloader（yt-dlp 封装）

**Files:**
- Create: `scripts/downloader.py`
- Test: `tests/test_downloader.py`

说明：`runner(cmd: list[str]) -> str` 注入执行 yt-dlp 并返回 stdout，测试中 mock。
`list_videos` 用 `yt-dlp -J` 探测（单视频返回 dict，主页返回含 `entries` 的 dict）。
`download_audio` 调 yt-dlp 抽取音频，返回设置了 `audio_path` 的新 `VideoMeta`。

- [ ] **Step 1: 写失败测试**

```python
# tests/test_downloader.py
import json
from scripts.models import VideoMeta
from scripts.downloader import parse_entry, list_videos, download_audio


def test_parse_entry_maps_fields():
    e = {
        "id": "777",
        "title": "文案标题",
        "uploader": "博主",
        "webpage_url": "https://www.douyin.com/video/777",
        "upload_date": "20260601",
        "duration": 73,
    }
    m = parse_entry(e)
    assert m.aweme_id == "777"
    assert m.author == "博主"
    assert m.publish_date == "2026-06-01"
    assert m.duration == 73.0
    assert m.audio_path == ""


def test_parse_entry_handles_missing_date():
    m = parse_entry({"id": "1"})
    assert m.publish_date == ""
    assert m.title == "1"  # 标题缺失时回落到 id


def test_list_videos_single(monkeypatch):
    payload = json.dumps({"id": "777", "title": "t", "upload_date": "20260601", "duration": 5})
    out = list_videos("https://www.douyin.com/video/777", limit=10, cookie="", runner=lambda cmd: payload)
    assert len(out) == 1 and out[0].aweme_id == "777"


def test_list_videos_playlist_respects_limit():
    payload = json.dumps({"entries": [{"id": str(i)} for i in range(5)]})
    out = list_videos("https://www.douyin.com/user/x", limit=2, cookie="", runner=lambda cmd: payload)
    assert [m.aweme_id for m in out] == ["0", "1"]


def test_download_audio_sets_path(tmp_path):
    captured = {}
    def runner(cmd):
        captured["cmd"] = cmd
        return ""
    m = VideoMeta("777", "t", "a", "u", "", 0.0, "")
    out = download_audio(m, str(tmp_path), cookie="", runner=runner)
    assert out.audio_path == str(tmp_path / "777.mp3")
    assert "yt-dlp" in captured["cmd"][0]
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_downloader.py -v`
Expected: FAIL，`No module named 'scripts.downloader'`

- [ ] **Step 3: 实现 downloader.py**

```python
# scripts/downloader.py
import json
import subprocess
from pathlib import Path
from scripts.models import VideoMeta


def _default_runner(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout


def parse_entry(e):
    up = e.get("upload_date") or ""
    date = f"{up[:4]}-{up[4:6]}-{up[6:8]}" if len(up) == 8 else ""
    vid = str(e.get("id", ""))
    return VideoMeta(
        aweme_id=vid,
        title=e.get("title") or e.get("description") or vid,
        author=e.get("uploader") or e.get("uploader_id") or "",
        url=e.get("webpage_url") or e.get("url") or "",
        publish_date=date,
        duration=float(e.get("duration") or 0),
        audio_path="",
    )


def _cookie_args(cookie):
    return ["--add-header", f"Cookie:{cookie}"] if cookie else []


def list_videos(url, limit, cookie, runner=None):
    runner = runner or _default_runner
    cmd = ["yt-dlp", "-J", *_cookie_args(cookie), url]
    data = json.loads(runner(cmd))
    entries = data.get("entries")
    if entries is None:
        return [parse_entry(data)]
    return [parse_entry(e) for e in entries[:limit]]


def download_audio(meta, dest_dir, cookie, runner=None):
    runner = runner or _default_runner
    out_tmpl = str(Path(dest_dir) / "%(id)s.%(ext)s")
    cmd = [
        "yt-dlp", "-x", "--audio-format", "mp3",
        *_cookie_args(cookie),
        "-o", out_tmpl, meta.url,
    ]
    runner(cmd)
    meta.audio_path = str(Path(dest_dir) / f"{meta.aweme_id}.mp3")
    return meta
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_downloader.py -v`
Expected: PASS（5 passed）

- [ ] **Step 5: 提交**

```bash
git add scripts/downloader.py tests/test_downloader.py
git commit -m "feat: add yt-dlp downloader producing VideoMeta"
```

---

## Task 7: transcribe（faster-whisper 封装）

**Files:**
- Create: `scripts/transcribe.py`
- Test: `tests/test_transcribe.py`

说明：`transcribe(audio_path, model, lang, loader=None)`。`loader(model_name) -> model_obj`，
`model_obj.transcribe(audio, language=lang)` 返回 `(segments, info)`，segments 元素有 `.text`。
测试用假 loader/假 model，不触真模型。

- [ ] **Step 1: 写失败测试**

```python
# tests/test_transcribe.py
from scripts.transcribe import transcribe


class _Seg:
    def __init__(self, text):
        self.text = text


class _FakeModel:
    def __init__(self, name):
        self.name = name

    def transcribe(self, audio, language=None):
        return ([_Seg(" 你好"), _Seg(" 世界")], {"language": language})


def test_transcribe_joins_segments():
    text = transcribe("/tmp/a.mp3", model="small", lang="zh", loader=lambda n: _FakeModel(n))
    assert text == "你好世界"


def test_transcribe_empty_audio_returns_empty():
    text = transcribe(
        "/tmp/a.mp3", model="small", lang="zh",
        loader=lambda n: type("M", (), {"transcribe": lambda self, a, language=None: ([], {})})(),
    )
    assert text == ""
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_transcribe.py -v`
Expected: FAIL，`No module named 'scripts.transcribe'`

- [ ] **Step 3: 实现 transcribe.py**

```python
# scripts/transcribe.py
def _default_loader(model_name):
    from faster_whisper import WhisperModel
    return WhisperModel(model_name, device="cpu", compute_type="int8")


def transcribe(audio_path, model, lang, loader=None):
    loader = loader or _default_loader
    m = loader(model)
    segments, _info = m.transcribe(audio_path, language=lang)
    return "".join(s.text for s in segments).strip()
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_transcribe.py -v`
Expected: PASS（2 passed）

- [ ] **Step 5: 提交**

```bash
git add scripts/transcribe.py tests/test_transcribe.py
git commit -m "feat: add faster-whisper transcription wrapper"
```

---

## Task 8: sync 编排 + CLI

**Files:**
- Create: `scripts/sync.py`
- Test: `tests/test_sync.py`

说明：`run(inputs, config, force, limit, lister, audio_fetcher, transcriber, today)` 为纯编排，
所有副作用通过参数注入，返回 `Summary(added, skipped, failed)`。`main()` 用 argparse 接 CLI 并装配真实实现。

- [ ] **Step 1: 写失败测试**

```python
# tests/test_sync.py
from scripts.models import VideoMeta
from scripts.config import Config
from scripts.sync import run, Summary


def _cfg(tmp_path):
    return Config(vault_path=str(tmp_path), subdir="抖音字幕", model="small", lang="zh", cookie="")


def _meta(i):
    return VideoMeta(str(i), f"标题{i}", "博主", f"u{i}", "2026-06-01", 1.0, "")


def test_run_writes_new_and_skips_existing(tmp_path):
    cfg = _cfg(tmp_path)
    metas = [_meta(1), _meta(2)]
    # 预置 1 的 md，使其被跳过
    d = tmp_path / "抖音字幕"
    d.mkdir(parents=True)
    (d / "标题1-1.md").write_text("old")

    summary = run(
        inputs=["https://www.douyin.com/user/x"],
        config=cfg,
        force=False,
        limit=10,
        lister=lambda url, limit, cookie: metas,
        audio_fetcher=lambda m, cookie: m,
        transcriber=lambda audio, model, lang: "转写内容",
        today="2026-06-07",
    )
    assert summary == Summary(added=1, skipped=1, failed=0)
    assert (d / "标题2-2.md").exists()
    assert (d / "标题1-1.md").read_text() == "old"  # 未被覆盖


def test_run_force_overwrites(tmp_path):
    cfg = _cfg(tmp_path)
    d = tmp_path / "抖音字幕"
    d.mkdir(parents=True)
    (d / "标题1-1.md").write_text("old")
    summary = run(
        inputs=["https://www.douyin.com/video/1"],
        config=cfg, force=True, limit=10,
        lister=lambda url, limit, cookie: [_meta(1)],
        audio_fetcher=lambda m, cookie: m,
        transcriber=lambda audio, model, lang: "新内容",
        today="2026-06-07",
    )
    assert summary == Summary(added=1, skipped=0, failed=0)
    assert "新内容" in (d / "标题1-1.md").read_text()


def test_run_counts_failures(tmp_path):
    cfg = _cfg(tmp_path)

    def boom(m, cookie):
        raise RuntimeError("下载失败")

    summary = run(
        inputs=["https://www.douyin.com/video/1"],
        config=cfg, force=False, limit=10,
        lister=lambda url, limit, cookie: [_meta(1)],
        audio_fetcher=boom,
        transcriber=lambda audio, model, lang: "x",
        today="2026-06-07",
    )
    assert summary == Summary(added=0, skipped=0, failed=1)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `.venv/bin/pytest tests/test_sync.py -v`
Expected: FAIL，`No module named 'scripts.sync'`

- [ ] **Step 3: 实现 sync.py**

```python
# scripts/sync.py
import argparse
import sys
import tempfile
from dataclasses import dataclass
from datetime import date

from scripts.config import load_config, ConfigError
from scripts.urls import classify, resolve_short_link
from scripts.render import render_markdown
from scripts.vault import target_path, should_skip, write_note
from scripts import downloader, transcribe


@dataclass
class Summary:
    added: int
    skipped: int
    failed: int


def run(inputs, config, force, limit, lister, audio_fetcher, transcriber, today):
    added = skipped = failed = 0
    for url in inputs:
        metas = lister(url, limit, config.cookie)
        for meta in metas:
            path = target_path(config.vault_path, config.subdir, meta)
            if should_skip(path, force):
                skipped += 1
                continue
            try:
                meta = audio_fetcher(meta, config.cookie)
                text = transcriber(meta.audio_path, config.model, config.lang)
                md = render_markdown(meta, text, model=config.model, synced_date=today)
                write_note(path, md)
                added += 1
            except Exception as exc:  # 单条失败不中断整体
                print(f"[失败] {meta.url}: {exc}", file=sys.stderr)
                failed += 1
    return Summary(added=added, skipped=skipped, failed=failed)


def _expand_inputs(raw):
    out = []
    for u in raw:
        out.append(resolve_short_link(u) if classify(u) == "short" else u)
    return out


def main(argv=None):
    parser = argparse.ArgumentParser(description="抖音视频字幕 -> Obsidian")
    parser.add_argument("inputs", nargs="+", help="博主主页 URL 或视频链接")
    parser.add_argument("--force", action="store_true", help="已存在也重转")
    parser.add_argument("--limit", type=int, default=20, help="主页最多拉取数量")
    parser.add_argument("--vault")
    parser.add_argument("--subdir")
    parser.add_argument("--model")
    args = parser.parse_args(argv)

    try:
        cfg = load_config()
    except ConfigError as e:
        print(str(e), file=sys.stderr)
        return 2
    if args.vault:
        cfg.vault_path = args.vault
    if args.subdir:
        cfg.subdir = args.subdir
    if args.model:
        cfg.model = args.model

    tmpdir = tempfile.mkdtemp(prefix="douyin-audio-")
    summary = run(
        inputs=_expand_inputs(args.inputs),
        config=cfg,
        force=args.force,
        limit=args.limit,
        lister=downloader.list_videos,
        audio_fetcher=lambda m, cookie: downloader.download_audio(m, tmpdir, cookie),
        transcriber=transcribe.transcribe,
        today=date.today().isoformat(),
    )
    print(f"完成：新增 {summary.added}，跳过 {summary.skipped}，失败 {summary.failed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: 运行测试确认通过**

Run: `.venv/bin/pytest tests/test_sync.py -v`
Expected: PASS（3 passed）

- [ ] **Step 5: 跑全量测试**

Run: `.venv/bin/pytest -v`
Expected: 全部 PASS（约 28 项）

- [ ] **Step 6: 提交**

```bash
git add scripts/sync.py tests/test_sync.py
git commit -m "feat: add sync orchestrator and CLI"
```

---

## Task 9: SKILL.md + 安装引导 + 冒烟测试文档

**Files:**
- Create: `SKILL.md`

- [ ] **Step 1: 写 SKILL.md**

```markdown
---
name: douyin-to-obsidian
description: 抓取抖音视频（博主主页批量或视频链接），用 faster-whisper 本地转写字幕，写入 Obsidian。触发词：抖音转文字、抖音字幕、douyin to obsidian、同步抖音到 obsidian。
---

# douyin-to-obsidian

把抖音视频转成文字字幕，落地到 Obsidian。

## 何时用
用户给出抖音博主主页链接（批量）或一个/多个视频分享链接，想把内容转成文字存进 Obsidian。

## 首次安装（缺依赖时引导用户确认后执行）
\`\`\`bash
cd /Users/mac/.claude/skills/douyin-to-obsidian
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
# ffmpeg 已装；如缺：brew install ffmpeg
\`\`\`
首次转写会自动下载 whisper 模型（small 约几百 MB），请耐心等待。

## 配置（环境变量）
- DOUYIN_OBSIDIAN_VAULT：vault 根目录（默认 Randy 的第二大脑）
- DOUYIN_SUBDIR：落地子目录（默认 抖音字幕）
- WHISPER_MODEL：small | medium | large-v3（默认 small）
- WHISPER_LANG：默认 zh
- DOUYIN_COOKIE：批量拉主页需要时设置

## 用法
\`\`\`bash
cd /Users/mac/.claude/skills/douyin-to-obsidian
.venv/bin/python -m scripts.sync "https://www.douyin.com/user/XXXX" --limit 20
.venv/bin/python -m scripts.sync "https://v.douyin.com/abc/" "https://www.douyin.com/video/777"
.venv/bin/python -m scripts.sync "<video-url>" --force   # 强制重转
\`\`\`

## 手动冒烟测试
1. 用一个公开博主主页跑 `--limit 1`，确认 vault/抖音字幕 下出现 1 个 md。
2. 用一个视频链接跑一次，核对 frontmatter 和正文。
3. 同一链接再跑一次，确认输出「跳过」。
```

- [ ] **Step 2: 提交**

```bash
git add SKILL.md
git commit -m "docs: add SKILL.md with usage and bootstrap"
```

---

## Self-Review 记录

- **Spec 覆盖**：输入分类(T3)/下载(T6)/转写(T7)/渲染(T4)/去重写入(T5)/配置(T2)/编排+CLI(T8)/错误汇总(T8)/安装引导+SKILL(T9) 全部对应。
- **占位**：无 TBD/TODO，每个代码步骤含完整代码。
- **类型一致**：`VideoMeta` 字段在 T1 定义，T4/T5/T6/T7/T8 一致引用；`Config` 字段 T2 定义，T8 一致；`Summary` T8 内自洽。
- **与 spec 的偏差（已知）**：下载器实现用 **yt-dlp 统一**（单视频 + 主页 entries），spec 里提的 `f2` 作为冒烟阶段的兜底备选——若 yt-dlp 对抖音主页支持不稳，再把 `list_videos` 的主页分支换成 f2（`VideoMeta` 契约不变）。SKILL.md 已注明。
```
