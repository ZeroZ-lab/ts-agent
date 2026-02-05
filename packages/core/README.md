# @ts-agent/core

提供最小可运行的 Agent 框架核心：模型接口、工具系统、回合 runner 与事件流。

## 示例

```ts
import {
  OpenAIResponsesModel,
  RuleBasedModel,
  createBuiltinTools,
  createChatSession
} from "@ts-agent/core";

const session = createChatSession({
  model: new RuleBasedModel(),
  tools: createBuiltinTools()
});

const result = await session.runTurn("现在几点");
console.log(result.events);
```

## 对接真实 LLM（OpenAI）

```ts
import { OpenAIResponsesModel, createBuiltinTools, createChatSession } from "@ts-agent/core";

const session = createChatSession({
  model: new OpenAIResponsesModel({ apiKey: process.env.OPENAI_API_KEY!, model: "gpt-4.1" }),
  tools: createBuiltinTools()
});
```
