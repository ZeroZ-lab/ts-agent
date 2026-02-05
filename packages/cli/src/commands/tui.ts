// CLI tui 命令：创建会话并启动 TUI

import { // 导入依赖
  createChatSession, // 执行语句
  createBuiltinTools, // 执行语句
  OpenAIChatCompletionsModel, // 执行语句
  OpenAIResponsesModel, // 执行语句
  RuleBasedModel, // 执行语句
  ScriptedModel // 执行语句
} from "@ts-agent/core"; // 执行语句
import type { TsAgentConfig } from "@ts-agent/core"; // 导入类型依赖
import { runTui } from "../tui/controller"; // 导入依赖

function createModelFromConfig(config: TsAgentConfig) { // 定义函数
  if (config.model.kind === "scripted") return new ScriptedModel(config.model.script as any); // 条件判断
  if (config.model.kind === "openai") { // 条件判断
    const envName = config.model.apiKeyEnv ?? "OPENAI_API_KEY"; // 声明常量
    const apiKey = process.env[envName]; // 声明常量
    if (!apiKey) { // 条件判断
      throw new Error(`Missing API key env: ${envName}`); // 抛出错误
    } // 结束代码块
    const api = config.model.api ?? "responses"; // 声明常量
    const common = { // 声明常量
      apiKey, // 执行语句
      model: config.model.model, // 执行语句
      baseUrl: config.model.baseUrl, // 执行语句
      apiPath: config.model.apiPath, // 执行语句
      instructions: config.model.instructions // 执行语句
    }; // 结束代码块
    return api === "chat_completions" ? new OpenAIChatCompletionsModel(common) : new OpenAIResponsesModel(common); // 返回结果
  } // 结束代码块
  return new RuleBasedModel(); // 返回结果
} // 结束代码块

export async function runTuiCommand(config: TsAgentConfig): Promise<void> { // 执行语句
  try { // 开始异常捕获
    const tools = config.tools.builtins ? createBuiltinTools() : []; // 声明常量
    const session = createChatSession({ // 声明常量
      model: createModelFromConfig(config), // 执行语句
      tools, // 执行语句
      runner: config.runner // 执行语句
    }); // 结束代码块
    await runTui({ session, config }); // 等待异步结果
  } catch (err) { // 执行语句
    const msg = err instanceof Error ? err.message : String(err); // 声明常量
    process.stderr.write(`ERROR: ${msg}\n`); // 输出到标准错误
    process.exitCode = 1; // 设置退出码
  } // 结束代码块
} // 结束代码块
