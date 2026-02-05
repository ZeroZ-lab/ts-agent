# 常见错误记录（自动追加）

格式：

```
- YYYY-MM-DD：现象 / 原因 / 修复（可带关键文件或 env key）
```

已记录：

- 2026-02-05：`OPENAI_BASE_URL` 写成 `hhttps://...` 导致启动时报 `Invalid OPENAI_BASE_URL` / 拼写错误 / 改为标准 `https://...`
- 2026-02-05：对不支持 `/v1/responses` 的 Provider 仍用 `OPENAI_API=responses` 导致 `404/405` / API 不兼容 / 切换为 `OPENAI_API=chat_completions`
- 2026-02-05：DeepSeek 侧使用了非本 provider 的模型名（如 `glm-4.7`）导致 `400 Model Not Exist` / 模型不匹配 / 改为 `OPENAI_MODEL=deepseek-chat`
