# Config（配置）指南

本项目通过根目录 `ts-agent.config.ts` + 环境变量（`.env`）配置模型与运行行为。

## 配置文件：`ts-agent.config.ts`

CLI 会从当前工作目录读取 `ts-agent.config.ts`（见 `packages/cli/src/config.ts`），并与默认值合并。

常用字段：

- `model`: 选择模型（`rule` / `scripted` / `openai`）
- `tools.builtins`: 是否启用内置工具（echo/math/clock）
- `runner.maxToolIters`: 工具循环上限（防止无限 tool loop）
- `runner.emitTrace`: CLI `run` 是否输出事件 trace

## 环境变量（`.env`）

> 注意：`.env` 被 `.gitignore` 忽略，不会提交到仓库。

### OpenAI 兼容配置（OpenAI / DeepSeek / 其他兼容方）

本仓库把“OpenAI 兼容”抽象成两类 API：

- `responses`: `POST {OPENAI_BASE_URL}{OPENAI_API_PATH}/responses`
- `chat_completions`: `POST {OPENAI_BASE_URL}{OPENAI_API_PATH}/chat/completions`

对应环境变量：

- `OPENAI_API_KEY`: API Key（必需）
- `OPENAI_MODEL`: 模型名（例如 `gpt-4.1` / `deepseek-chat`）
- `OPENAI_BASE_URL`: 仅 host（推荐）或带 provider 前缀路径的 base URL（必须是 `http(s)://...`）
- `OPENAI_API_PATH`: API path 前缀（默认 `/v1`）
- `OPENAI_API`: `responses`（默认）或 `chat_completions`

### 示例：OpenAI 官方

```bash
OPENAI_API_KEY="..."
OPENAI_BASE_URL="https://api.openai.com"
OPENAI_API_PATH="/v1"
OPENAI_API="responses"
OPENAI_MODEL="gpt-4.1"
```

### 示例：DeepSeek（OpenAI-compatible）

> DeepSeek 通常不支持 `/responses`，建议用 `chat_completions`。

```bash
OPENAI_API_KEY="..."
OPENAI_BASE_URL="https://api.deepseek.com"
OPENAI_API_PATH="/v1"
OPENAI_API="chat_completions"
OPENAI_MODEL="deepseek-chat"
```

## 常见坑

- `OPENAI_BASE_URL` 写错协议（例如 `hhttps://...`）会导致配置加载时报错。
- Provider 不支持 `responses` 时会出现 `404/405`，此时切换到 `OPENAI_API="chat_completions"`。
- `OPENAI_MODEL` 必须是当前 Provider 真实支持的模型名，否则会 `400 Model Not Exist`。

