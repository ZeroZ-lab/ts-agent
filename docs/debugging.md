# Debugging（排障）指南

本页记录 ts-agent 常见报错的“现象 → 原因 → 修复”。

## 快速定位（先看这 5 项）

1. 你当前用的模型是什么？（TUI banner 会显示：`openai / <model> (<api>)`）
2. `OPENAI_BASE_URL` / `OPENAI_API_PATH` / `OPENAI_API` 是否与 Provider 匹配？
3. `OPENAI_MODEL` 是否是该 Provider 真实存在的模型名？
4. 是否缺少 `OPENAI_API_KEY`（或你在 `ts-agent.config.ts` 里指定的 `apiKeyEnv`）？
5. CLI 是否输出了 trace（`runner.emitTrace=true`）？`turn_failed` 里的 error message 往往就是根因。

## 模板（建议记录错误时用这个格式）

- 现象：
- 原因：
- 修复：
- 复发预防（可选）：

## 405 Not Allowed（常见于 responses）

- 现象：`OpenAIResponsesModel: HTTP 405 Not Allowed`，返回 HTML 或 provider 自己的错误页。
- 原因：当前 Provider 不支持 OpenAI Responses API（`/responses`），或该路径不允许 POST。
- 修复：
  1) 把 `.env` 设置为走 chat completions：
     - `OPENAI_API="chat_completions"`
     - `OPENAI_API_PATH="/v1"`（或 provider 要求的路径）
  2) 重启 `bun run dev` 再试。

## 404 Not Found（常见于 responses）

- 现象：`OpenAIResponsesModel: HTTP 404 Not Found`，body 可能为空。
- 原因：
  - Provider 根本没有 `/responses` 路由（多数 OpenAI-compatible 只实现 `/chat/completions`）
  - 或 `OPENAI_API_PATH` 配错（拼出来的 URL 不存在）
- 修复：
  - 优先改 `OPENAI_API="chat_completions"`；
  - 校验 `OPENAI_BASE_URL` + `OPENAI_API_PATH` 拼出来是否是 provider 文档里的真实地址。

## 400 Bad Request: Model Not Exist

- 现象：`OpenAIChatCompletionsModel: HTTP 400 ... {"message":"Model Not Exist"...}`
- 原因：`OPENAI_MODEL` 不是该 Provider 的模型名（例如把 `glm-4.7` 用在 DeepSeek 上）。
- 修复：把 `OPENAI_MODEL` 改成 provider 支持的名字（例如 DeepSeek 常见为 `deepseek-chat` / `deepseek-reasoner`）。

## 配置加载失败：Invalid OPENAI_BASE_URL

- 现象：启动时直接报错，例如：
  - `Invalid OPENAI_BASE_URL: hhttps://... (expected http(s)://...)`
- 原因：`.env` 里 base url 写错，或有多余引号/空格导致解析结果异常。
- 修复：把 `OPENAI_BASE_URL` 改为标准 `https://...`（推荐仅 host，不要手写多余路径）。

## Missing API key env

- 现象：`Missing API key env: OPENAI_API_KEY`
- 原因：未设置该环境变量，或你配置了 `apiKeyEnv` 指向别的 key。
- 修复：设置对应环境变量并重启进程（TUI/CLI 都需要重启才能读到新的 env）。

