// ts-agent 配置入口：读取环境变量并导出 TsAgentConfig

import type { TsAgentConfig } from "@ts-agent/core"; // 导入类型依赖

function cleanEnv(value: string | undefined): string | undefined { // 定义函数
  if (value == null) return undefined; // 条件判断
  const trimmed = value.trim(); // 声明常量
  if (!trimmed) return undefined; // 条件判断
  const quoted = // 声明常量
    (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'")); // 执行语句
  return quoted ? trimmed.slice(1, -1).trim() : trimmed; // 返回结果
} // 结束代码块

const openaiModel = cleanEnv(process.env.OPENAI_MODEL); // 声明常量
const openaiBaseUrl = cleanEnv(process.env.OPENAI_BASE_URL); // 声明常量
const openaiApi = cleanEnv(process.env.OPENAI_API); // 声明常量
const openaiApiPath = cleanEnv(process.env.OPENAI_API_PATH); // 声明常量
if (openaiBaseUrl && !/^https?:\/\//u.test(openaiBaseUrl)) { // 条件判断
  throw new Error(`Invalid OPENAI_BASE_URL: ${openaiBaseUrl} (expected http(s)://...)`); // 抛出错误
} // 结束代码块

const config = { // 声明常量
  model: { // 执行语句
    kind: "openai", // 执行语句
    model: openaiModel ?? "glm-4.7", // 执行语句
    api: openaiApi === "chat_completions" ? "chat_completions" : "responses", // 执行语句
    apiKeyEnv: "OPENAI_API_KEY", // 执行语句
    baseUrl: openaiBaseUrl, // 执行语句
    apiPath: openaiApiPath // 执行语句
  }, // 执行语句
  tools: { builtins: true }, // 执行语句
  runner: { maxToolIters: 8, emitTrace: true }, // 执行语句
  tui: { transcriptMaxLines: 400 } // 执行语句
} satisfies TsAgentConfig; // 执行语句

export default config; // 导出默认值
