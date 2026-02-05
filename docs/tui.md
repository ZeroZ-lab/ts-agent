# TUI 设计与可测试性

## 目标

- 最小交互：输入一行 → 回车发送 → 展示 assistant 回复与工具调用 trace
- 可测试：核心逻辑用纯函数 `reducer` 与 `render`

## 分层

- `controller.ts`：负责 raw mode、键盘输入、把事件转成 action（薄层 I/O）
- `state.ts`：`(state, action) -> state` 纯函数
- `render.ts`：`state -> string` 纯函数（输出 ANSI 字符串）

## 测试策略

只测 `state.ts` 与 `render.ts`：

- 初始 state 渲染内容
- append transcript 的行为
- 输入变化与发送后清空输入

