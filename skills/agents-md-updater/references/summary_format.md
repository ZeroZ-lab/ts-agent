# 追加格式（变更摘要 / 错误复盘）

## 格式

使用以下格式追加一行：

```
- YYYY-MM-DD：一句话变更摘要（可包含关键文件路径）
```

## 示例

```
- 2026-02-05：新增 OpenAI Chat Completions 模型适配（packages/core/src/model/*）
```

错误复盘示例：

```
- 2026-02-05：`OPENAI_API=responses` 在 DeepSeek 上 404 / provider 不支持 / 改用 `OPENAI_API=chat_completions`
```
