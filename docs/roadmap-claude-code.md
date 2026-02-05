# Roadmap：ts-agent 迈向 Claude Code 级别

目标：在保持 core 简洁与可测试（BDD）优先的前提下，把 ts-agent 从“学习向最小 agent”演进到“开发协作可用的代码智能体”（接近 Claude Code 的体验）。

## 能力模块（Why / Where / Done）

### 1) 任务编排（Planner / Orchestrator）

- Why：把“用户一句话”拆成可验证步骤与验收标准，减少反复试错。
- Where（建议目录）：
  - `packages/core/src/planner/*`：纯逻辑（输入：目标、上下文；输出：计划、验收标准、风险提示）
  - `packages/cli`：命令层展示（例如 `ts-agent plan "...“`）
- Done（验收）：
  - 给定需求，输出分步计划（每步可独立验证）
  - 能生成“完成判据”（例如测试、命令、文件变更点）

### 2) 工具执行与安全策略（Tool runtime + Policy）

- Why：避免副作用失控（危险命令、secret 泄露），让工具调用可追溯。
- Where：
  - `packages/core/src/tool/*`：工具规范与运行
  - `packages/core/src/policy/*`：权限与确认策略（危险操作白名单/黑名单）
- Done：
  - 工具调用有清晰事件（started/completed/failed）
  - 危险操作必须明确确认（CLI/TUI 层）

### 3) 工作区理解（Context selection）

- Why：更像“会读代码的同事”，而不是盲猜。
- Where：
  - `packages/core/src/context/*`：索引/候选文件选择/摘要
- Done：
  - 给定问题，输出“为什么选这些文件”与引用清单
  - 控制上下文大小，避免把无关文件塞进 prompt

### 4) 开发闭环（Build/Test/Lint/Diagnosis loop）

- Why：代码智能体的核心竞争力是“能把事情做完”，而不是只会建议。
- Where：
  - 初期：文档化（`docs/debugging.md` + `AGENTS.md` 约定）
  - 后续：CLI 增加 `check/fix` 子命令（最小可行闭环）
- Done：
  - 能跑测试、解析失败、定位最小修改、回归通过

### 5) 可观测性（Events/Trace）

- Why：可调试、可复盘、可测试（BDD）。
- Where：
  - `packages/core/src/events/types.ts`：事件类型统一入口
  - `packages/cli/src/tui/*`：事件驱动渲染
- Done：
  - turn/model/tool 关键节点都有事件
  - 错误分类可直接指导修复（例如配置错误 vs provider 不兼容）

### 6) Git 工作流（可选增强）

- Why：让 agent 真正融入工程协作（commit/PR/变更摘要/回滚）。
- Where：
  - 先规范：`AGENTS.md` + skill（变更摘要、错误复盘）
  - 再实现：CLI 新命令（例如 `ts-agent pr`）
- Done：
  - 自动生成变更摘要（Changelog style）
  - 支持基础分支/提交/推送流程（受权限策略约束）

## 里程碑（Timeboxed）

### M1（1–2 周）：可用的“协作型 CLI agent”

- 文档与规范：
  - `AGENTS.md` 有 docs 索引与“变更摘要/错误复盘”入口
  - `docs/config.md` / `docs/debugging.md` 完整可用
- 体验增强：
  - TUI 明确显示 model/api/baseUrl/apiPath
  - 配置错误提示明确（Invalid base url / missing key / model not exist）

### M2（1 个月）：最小 Planner + 基础闭环

- `ts-agent plan "<goal>"`：输出步骤与验收标准
- `ts-agent run` 能把计划步骤串起来（不强制自治修复，但能指向“下一步做什么”）
- 每个新增能力都有 BDD spec 覆盖

### M3（3 个月）：接近 Claude Code 的“修复型 agent”

- 开发闭环（check/fix）更自动化：能跑测试→定位→修复→回归
- Context selection 更可靠：引用清单 + 变更影响分析
- Policy 更完善：危险操作确认、可持久化允许规则

