# Models（模型）指南

## Model 接口

`Model.generate({ messages, tools })` 返回：

- `content`: 直接输出 assistant 文本
- `toolCalls`: 请求调用工具（Runner 将执行工具并把结果作为 `tool` 消息追加）

## 内置模型（MVP）

- `RuleBasedModel`: 基于关键词/简单规则触发工具，适合本地学习与演示
- `ScriptedModel`: 测试用脚本模型，每次 generate 按预置队列返回响应

## 对接真实 LLM：OpenAI Responses API

Core 内置 `OpenAIResponsesModel`（支持 tool calling）。

## OpenAI Chat Completions（OpenAI-compatible）

当 Provider 不支持 `/responses`（常见），可以使用 `chat/completions`：

- Core 内置：`OpenAIChatCompletionsModel`
- 走：`POST {baseUrl}{apiPath}/chat/completions`

### 配置方式

1) 设置环境变量（不要写进代码/仓库）：

```bash
export OPENAI_API_KEY="..."
```

2) 修改根目录 `ts-agent.config.ts`：

```ts
export default {
  model: {
    kind: "openai",
    model: "gpt-4.1",
    api: "responses", // 或 "chat_completions"
    baseUrl: "https://api.openai.com",
    apiPath: "/v1"
  },
  tools: { builtins: true },
  runner: { maxToolIters: 8, emitTrace: true },
  tui: { transcriptMaxLines: 400 }
};
```

然后运行：

```bash
bun run ts-agent tui
```
