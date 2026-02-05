# 架构概览

## 目标

- 最小闭环：用户输入 → 模型生成（可触发工具）→ 工具执行 → 模型总结回复
- 可观测：运行过程通过事件流 `RunnerEvent` 输出（TUI/日志/测试复用）
- 可测试：核心逻辑不直接写 stdout；TUI 核心使用纯函数 reducer/render

## 核心概念

- **ChatSession**：持有多轮对话 `messages`，提供 `runTurn()` 执行一次回合
- **Model**：根据 messages + tools 生成 `content` 或 `toolCalls`
- **Tool**：可被调用的能力（纯内存工具为主）
- **RunnerEvent**：统一事件流，描述模型调用、工具调用、回合完成/失败

## 单回合数据流（Turn）

1. 追加 `user` 消息到会话 messages
2. 循环：
   - 调用 `model.generate({ messages, tools })`
   - 若返回 `toolCalls`：按顺序执行 tool，并把 tool 结果追加为 `tool` 消息
   - 否则：追加 `assistant` 消息并结束
3. 产出 `turn_completed` 或 `turn_failed`

