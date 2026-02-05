# Tools（工具）指南

## Tool 接口

一个 Tool 包含：

- `spec`: 名称、描述、参数 schema
- `run(args, ctx)`: 执行并返回 JSON 结果

Runner 只做三件事：

1. 根据 `toolCalls` 找到对应工具
2. 顺序执行
3. 记录 `tool_started/tool_completed/tool_failed` 事件，并把结果追加为 `tool` 消息

## 内置工具（MVP）

- `echo`: 返回输入文本
- `math`: 计算简单算术表达式（安全解析，不使用 `eval`）
- `clock`: 返回当前时间（可注入 `ctx.now()` 便于测试）

