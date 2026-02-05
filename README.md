# ts-agent (Bun + TypeScript)

一个学习向的 Agent 框架：`@ts-agent/core`（可复用库）+ `@ts-agent/cli`（自带 TUI 交互）。全程 BDD：先写行为测试，再实现功能。

## 快速开始

要求：Bun（已安装）

### 运行 TUI

```bash
bun run ts-agent tui
```

### 单次运行（打印 trace）

```bash
bun run ts-agent run "现在几点"
bun run ts-agent run "计算 1+2*3"
```

### 测试

```bash
bun test
```

## 对接真实 LLM（OpenAI）

1) 设置环境变量：

```bash
export OPENAI_API_KEY="..."
```

2) 把 `ts-agent.config.ts` 的 `model` 改成：

```ts
model: { kind: "openai", model: "gpt-4.1" }
```

## 目录结构

- `packages/core`: Agent 运行器、模型接口、工具系统、事件流
- `packages/cli`: `ts-agent` CLI（run + TUI）
- `docs/`: 架构与开发文档

## Roadmap（MVP 已覆盖）

- [x] Core runner + events
- [x] Builtin tools: echo / math / clock
- [x] Models: RuleBased / Scripted
- [x] CLI: run + TUI
- [x] BDD DSL（Given/When/Then）与行为测试

## 文档

见 `docs/`。
