# 称呼

每次回答开头都叫我一声大王。

# ts-agent — AI 协作指南（agent.md）

本文件用于让 AI/自动化代理快速理解并协作开发本仓库：项目目标、架构、约定、入口、如何扩展与如何测试。

## 项目目标

- 用 **Bun + TypeScript** 实现一个学习向 Agent 框架：
  - `@ts-agent/core`：可复用的 Agent 核心（模型/工具/runner/事件）
  - `@ts-agent/cli`：命令行 + 最小 TUI 聊天界面
- 开发模式：**BDD（行为驱动）**，先写 Given/When/Then 测试，再实现。
- MVP 内置：
  - Tools：`echo` / `math` / `clock`（纯内存工具）
  - Models：`RuleBasedModel` / `ScriptedModel` / `OpenAIResponsesModel` / `OpenAIChatCompletionsModel`

## 快速命令

- 运行测试：`bun test`
- 启动 TUI：`bun run ts-agent tui`
- 单次运行（打印 trace）：`bun run ts-agent run "计算 1+2*3"`

## 目录结构（重要入口）

- Core
  - `packages/core/src/chat/chat_session.ts`：`ChatSession.runTurn()`（核心执行循环）
  - `packages/core/src/events/types.ts`：`RunnerEvent`（TUI/日志/测试统一事件）
  - `packages/core/src/tool/builtins.ts`：`createBuiltinTools()`（echo/math/clock）
  - `packages/core/src/model/`
    - `rule_model.ts`：规则模型（本地演示）
    - `scripted_model.ts`：脚本模型（测试）
    - `openai_responses_model.ts`：OpenAI Responses API 适配（真实 LLM + tool calling）
- CLI
  - `packages/cli/src/main.ts`：CLI 入口（`tui` / `run`）
  - `packages/cli/src/config.ts`：读取 `ts-agent.config.ts`
  - `packages/cli/src/tui/`：TUI（`state.ts` reducer / `render.ts` / `controller.ts`）
- 文档：`docs/`（架构、BDD、TUI、Tools、Models、Config、Debugging、Roadmap）

## 文档索引（docs/）

- `docs/architecture.md`：核心数据流与模块边界（messages/tools/runner）
- `docs/bdd.md`：BDD 约定与测试写法（Given/When/Then）
- `docs/models.md`：模型适配（rule/scripted/openai：responses/chat_completions）
- `docs/tools.md`：内置工具与新增工具流程
- `docs/tui.md`：TUI 设计（state/reducer/render/controller）与可测试优先
- `docs/config.md`：`ts-agent.config.ts` / `.env` / Provider 兼容与示例
- `docs/debugging.md`：常见报错（405/404/400 等）与排查清单
- `docs/roadmap-claude-code.md`：迈向 Claude Code 的能力模块与里程碑

## 核心架构（你需要理解的 3 件事）

### 1) 消息（ChatMessage）

位于 `packages/core/src/chat/types.ts`。

- `user`/`system`/`assistant`：文本消息
- `tool`：工具输出（关联 `toolCallId`）
- **关键点**：当模型返回 `toolCalls` 时，runner 会在执行工具前先把“assistant 发起的 toolCalls”写入 messages，
  这样真实 LLM（OpenAI）在下一次请求时能看到“我刚才调用了什么工具”以及对应的 `function_call_output`。

### 2) 工具（Tool）

位于 `packages/core/src/tool/types.ts`。

- `Tool.spec`：`name/description/schema`
- `Tool.run(args, ctx)`：返回 JSON（runner 会把返回值 `JSON.stringify` 写入 tool message）
- MVP 不提供文件/网络/shell 工具，避免副作用与安全复杂度。

### 3) 单回合执行循环（Turn runner）

位于 `packages/core/src/chat/chat_session.ts`。

单回合流程：

1. 追加 `user` 消息
2. 调用 `model.generate({ messages, tools })`
3. 若返回 `toolCalls`：
   - 写入 assistant(toolCalls) 消息
   - 顺序执行 tool（受 `maxToolIters` 限制）
   - 把工具结果写为 `tool` 消息
   - 回到步骤 2
4. 若返回 `content`：
   - 写入 assistant 文本消息
   - 结束，产出 `turn_completed`

所有关键节点产出 `RunnerEvent`（见 `packages/core/src/events/types.ts`），CLI/TUI 用事件驱动渲染，不在 core 里直接 stdout。

## 真实 LLM：OpenAI（Responses API）

实现：`packages/core/src/model/openai_responses_model.ts`

- 走 `POST /v1/responses`
- 支持：
  - assistant 文本输出（`output_text`）
  - function calling（`function_call`）→ 映射到 core 的 `toolCalls`
  - tool 输出通过 `function_call_output` 回传（使用 `toolCallId` 对齐）

### 配置方式

根目录 `ts-agent.config.ts` 支持：

```ts
model: { kind: "openai", model: "gpt-4.1", apiKeyEnv: "OPENAI_API_KEY" }
```

然后设置环境变量（不要提交到仓库）：

```bash
export OPENAI_API_KEY="..."
```

## BDD 开发约定（必须遵守）

- 新增功能的顺序：
  1) 在相邻目录先写 `*.spec.ts`（Given/When/Then）
  2) 再实现最小代码让测试通过
  3) 补文档（`docs/` 或对应 package README）
- BDD DSL：
  - `packages/core/src/test/bdd.ts`（轻量 Given/When/Then）
- 现有测试例子：
  - runner 行为：`packages/core/src/test/runner.spec.ts`
  - RuleBasedModel 行为：`packages/core/src/test/rule_model.spec.ts`
  - OpenAI 模型适配：`packages/core/src/test/openai_model.spec.ts`
  - TUI reducer/render：`packages/cli/src/tui/tui.spec.ts`

## TUI 设计（可测试优先）

目标：最小可用聊天界面，不追求复杂多窗格。

- `packages/cli/src/tui/state.ts`：纯函数 reducer（状态与 action）
- `packages/cli/src/tui/render.ts`：纯函数渲染（ANSI 字符串）
- `packages/cli/src/tui/controller.ts`：I/O 薄层（raw mode、键盘、把 runner event → action）

如果要增强 TUI：

- 优先扩展 `state.ts` 的 action/state 与 `render.ts`，并为其新增 BDD 测试
- 避免把逻辑塞进 `controller.ts`

## 扩展指南（常见任务怎么做）

### 新增一个 Tool

1. 在 `packages/core/src/tool/` 增加实现（或扩展 `builtins.ts`）
2. 为 runner 行为补测试（工具成功/失败、事件顺序、messages 追加）
3. 更新 `docs/tools.md`

### 新增一个 Model Provider

1. 在 `packages/core/src/model/` 新增文件，实现 `Model.generate()`
2. 增加一个 BDD spec 覆盖：
   - text 输出
   - toolCalls 输出
   - 错误处理（非 2xx 等）
3. 更新 `docs/models.md`
4. 如果需要 CLI 可选：扩展 `TsAgentConfig` + CLI 的 `createModelFromConfig`

### 调整 runner 行为（高影响变更）

任何改变都需要更新：

- `packages/core/src/events/types.ts`（如新增事件）
- 相关 spec（runner/tui）
- `docs/architecture.md`（如数据流变化）

## 安全与约束（默认）

- 不要在仓库里写入任何 API Key。
- MVP 不引入文件系统写入、shell 执行、网络抓取等高风险工具。
- OpenAI Provider 的网络调用只在用户显式配置 key 后才会发生；测试使用 fake fetch，不打真实网络。

## 变更摘要（自动追加）

> 由 `skills/agents-md-updater` 自动维护：每次新增/修改功能后，追加一条一句话摘要（带日期）。

- 2026-02-05：新增文档索引与配置/排障/roadmap 文档（AGENTS.md, docs/*）
## 错误复盘（自动追加）

> 由 `skills/agents-md-updater` 自动维护：记录踩坑与修复，避免重复犯错。

@AGENTS/ERRORS.md
