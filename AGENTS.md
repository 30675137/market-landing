# ecom-ai-system Agents

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

<!-- dev-sop-flow:agent-roles:start -->
## Agent Roles

| Tool | Role | How to start |
|---|---|---|
| Claude Code | Implement assigned REQs from dispatch task packs | `claude` inside the assigned worktree |
| Codex | Implement assigned REQs from dispatch task packs | `codex` inside the assigned worktree |

Each agent must read the assigned task pack before editing files.
Use `/dev-sop-flow dispatch --req REQ-001,REQ-002` to create isolated worktrees and prompts.
<!-- dev-sop-flow:agent-roles:end -->
