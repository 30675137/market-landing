# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

<!--
本模板由 `/dev-sop-flow init` 追加到项目 CLAUDE.md 末尾。
默认基底：Karpathy 风格 CLAUDE.md（forrestchang/andrej-karpathy-skills 仓库）。
基底用于通用编码偏好；本块负责 dev-sop-flow 工作流的强制约束。
init 时用户可关闭基底，那时本块即整份 CLAUDE.md。
-->

# ecom-ai-system — Claude Code 项目指令

> 由 `/dev-sop-flow init` 生成于 2026-06-14。
> 修改本文件后，新会话生效。已运行的 agent 不会自动重载。

<!-- dev-sop-flow:shared-rules:start -->
# dev-sop-flow Shared Agent Rules

These rules apply to every AI agent working in this project, including Claude Code and Codex.

## Source of Truth

- Business PRD lives in Feishu Doc after `/dev-sop-flow propose --doc`.
- Engineering spec lives in `specs/{NNN-name}/spec.md`.
- Strategic plan lives in `specs/{NNN-name}/plan.md`.
- Tactical implementation plan lives in `specs/{NNN-name}/implementation-plan.md`.
- Sprint and REQ state live in the Feishu Bitable managed by dev-sop-flow.

Do not create a second source of truth for REQ status outside dev-sop-flow.

## Required Flow

1. Confirm the assigned REQ ID before editing.
2. Confirm the REQ is in `Task` or later before implementation.
3. Read the task pack when working from dispatch.
4. Stay inside owned paths unless the user explicitly expands scope.
5. Do not edit protected paths unless the user explicitly authorizes it.
6. Run the verification commands listed in the task pack or implementation plan.
7. After implementation, sync with the appropriate command:
   - Normal non-dispatch work uses `/dev-sop-flow sync REQ-XXX`.
   - Dispatched work must use `/dev-sop-flow sync REQ-XXX --from-dispatch SPRINT-XXX`.

## UI Brief Gate

If `是否UI相关 = 是`, implementation must not start until:

- `UI Brief状态 = 已确认`
- `UI Brief链接` is non-empty
- The UI Implementation Brief has been read

UI work must follow the confirmed UI Brief, UIDEMO evidence, and UI Design Contract.

## Dispatch Worktree Rules

- One dispatched REQ uses one worktree and one branch.
- Do not switch a dispatch worktree to another REQ.
- Do not merge another dispatched branch into your worktree unless the user asks.
- If the task pack is already marked conflict or high-risk by dispatch, keep changes minimal and document the marked risk.

## Audit and Handoff

Every completed REQ handoff must include:

- Changed files
- Verification commands and results
- Commit or PR link
- Tool name and model, if known
- Any skipped checks and the reason

The AI audit log must identify the actual tool that implemented the REQ.
<!-- dev-sop-flow:shared-rules:end -->

<!-- dev-sop-flow:claude-specific:start -->

## 项目宪章

# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every li

## 强制工作流

本项目使用 `dev-sop-flow` SOP 管理研发生命周期。AI agent 必须遵守：

1. **任何代码改动前**：在多维表格「03-需求管理」查到对应 `REQ-ID`，确认状态为「已规划」或之后阶段
2. **不绕过人工门**：阶段 2（Spec+方案）、阶段 3（Plan）、阶段 5（验收）三处需用户显式确认
3. **关键节点必须 sync**：完成 specify / clarify / plan / task / validate / implement 任一阶段后，运行 `/dev-sop-flow sync REQ-{{ID}}` 回写多维表格
4. **UI Brief Gate**：任何 `是否UI相关=是` 的 REQ/FUNC，禁止直接从 PRD 实现 UI。必须先使用 `$prd-uidemo-ui-brief`，基于 PRD、`docs/ui-design-contract.md` 和相关 UIDEMO 证据源（本地原型代码、Figma Design，或混合来源）生成 UI Implementation Brief；人工确认并回写 `UI Brief状态=已确认`、`UI Brief链接` 后，才允许进入 Task/Implement
5. **UI 验收 Gate**：UI 相关 REQ/FUNC 收尾前必须按 UI Brief、UIDEMO 和 UI Design Contract 完成 `/design-review` 或 `/qa`，并在多维表格标记 `UI验收状态=通过`

## 飞书多维表格

- **URL**：https://j13juzq4tyn.feishu.cn/base/JMGObsLqvamoCAsxGgHcxzqtn5u
- **9 张表（v0.6，按 traceability 从上到下编号）**：01-用户故事（US）→ 02-业务用例清单（UC，可选）→ **03-需求管理（REQ，状态机唯一主体）** → 04-功能清单（FUNC，3 态简化）；05-Sprint管理 / 06-AI审计日志 / 07-踩坑记录 / **08-AC（验收用例）** / **09-Defect（缺陷）** （横切支撑）
- **Traceability**：US ↔ REQ (M:N) → FUNC (M:N)；AC 横切验收、Defect 横切质量。详见 status-machine.md §Traceability 模型
- **商业模块维度（v0.6）**：仅 03-需求管理 表维护 `商业模块` 字段（A-小程序商城 ... M-渠道开放 共 13 选项）；US/UC/FUNC/AC 通过 lookup 反查。`04-功能清单` 另含 `产品线/版本归属/基础版报价` FUNC 颗粒度字段。各表「状态」均含「冻结」选项
- **PRD 管理（v0.6）**：业务 PRD 在飞书云空间 `PRD/{商业模块}/REQ-NNN-{标题}.docx`（SSOT）。Obsidian 文件上传后冻结为只读快照。改动通过 `/dev-sop-flow propose --update` 同步到表
- **UI Brief Gate**：UI 相关需求必须维护 `是否UI相关` / `UI平台` / `UI来源类型` / `UIDEMO路径` / `Figma链接` / `Figma节点` / `UI证据摘要链接` / `UI Design Contract路径` / `UI Brief链接` / `UI Brief状态` / `UI风险等级` / `UI验收状态`
- **状态字段**：见 `dev-sop-flow` skill 的 `references/status-machine.md`（运行 `/dev-sop-flow` 在会话内查阅）
- **AI 审计日志规范**：见 `dev-sop-flow` skill 的 `references/ai-audit-spec.md`

## 必用技能

- spec-kit：`specify` / `clarify` / `plan` / `task` / `validate`
- UI Brief：`$prd-uidemo-ui-brief`（UI 相关 REQ/FUNC 进入 Task 前必用）
- superpowers：`brainstorming` / `writing-plans` / `executing-plans` / `verification-before-completion` / `ship`

## 按需技能（gstack）

代码审查必用 `/review`；含前端则 `/design-shotgun` + `/design-review`；架构变动用 `/plan-eng-review`；复杂 bug 用 `/investigate`；交付前用 `/qa` + `/cso`；上线用 `/land-and-deploy` + `/canary`；Sprint 收尾用 `/retro` + `/document-release`。

## 闭坑流程（Lessons Learned）

业务侧审计日志（RBAC 操作日志）只记录"谁做了什么"，不解决"下次怎么不再踩"。本项目用**双层闭坑机制**与 AI 审计日志、业务审计日志互补。

### 第一层：本地工作底稿 `docs/lessons-learned.md`

随手追加，门槛极低，AI agent 与开发者共写。

**写入时机（任一触发即写）**：
- 跑完 `/investigate` / `/qa` / `/cso` 发现非平凡问题
- 任何"绕了弯路才修好"的 bug fix（重写超出初判范围 / 重新 grep / 重读不熟悉模块）
- 生产事件 / 上线 rollback / 回滚操作完成后
- AI agent 自身踩坑（误删文件 / clone 落到错误目录 / 字段名拼写等）

**格式约束**：每条 ≤ 5 行，必含「症状 / 触发条件 / 根因 / 防御」四要素。模板见 `docs/lessons-learned.md` 顶部。

**不写**：拼写错误、IDE 自动修复、依赖小升级。

### 第二层：飞书「07-踩坑记录」表（PIT-NNN）

每个 Sprint retro 时，由 PO + TL review `lessons-learned.md` 增量条目，把高价值条目录入飞书「07-踩坑记录」表（https://j13juzq4tyn.feishu.cn/base/JMGObsLqvamoCAsxGgHcxzqtn5u），并决定：

- **是否转 DoD**：是 → 在下个 Sprint 的 DoD 增量里加这条防御措施；否 → 仅做团队知识沉淀
- **关联**：REQ-XXX / SPRINT-XXX / PR 链接

`/dev-sop-flow end-sprint` retro 阶段会自动询问哪些条目入表。

### 与现有审计机制的边界

| 机制 | 记什么 | 谁看 |
|---|---|---|
| 业务侧审计日志（DB / `@Log`） | 单条操作的 who-did-what-when | 财务 / 客服 / 监管（合规） |
| AI 审计日志（飞书表 + `ai-audit-spec.md`） | AI agent 每个阶段的动作链 | TL / PO 验收 |
| **闭坑底稿** `docs/lessons-learned.md` | 单次踩坑四要素 | 开发团队 |
| **踩坑记录表** | 高价值复盘 + 防御转 DoD | PO / TL / 全员 |

### 不允许

- 仅写"修了 bug X"而不记症状/根因/防御 → review 不通过
- 同一类坑两次踩仍未升级到飞书表或 DoD → retro 必须显式 review

## 禁止事项

- **禁止跳过 spec → plan 直接写代码**（除非 PO 明确说"hot-fix"）
- **禁止在多维表格之外维护需求/Sprint 状态**（避免双源真相）
- **禁止以 `--no-verify` 跳过 git hooks**
- **禁止在 PR 没合并前修改 main 分支历史**

## 代码风格

_待定义_

> 本块由 `init` 模式根据 spec-kit 宪章生成。如未在 init 时定义，留空待用户填写。

<!-- dev-sop-flow:claude-specific:end -->
