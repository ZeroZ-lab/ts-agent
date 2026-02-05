// RuleBasedModel：规则驱动的本地模型

import type { ChatMessage, ToolMessage, UserMessage } from "../chat/types"; // 导入类型依赖
import type { ToolSpec } from "../tool/types"; // 导入类型依赖
import type { Model, ModelRequest, ModelResponse, ToolCall } from "./types"; // 导入类型依赖

function lastUserMessage(messages: ChatMessage[]): UserMessage | undefined { // 定义函数
  for (let i = messages.length - 1; i >= 0; i--) { // 循环遍历
    const m = messages[i]; // 声明常量
    if (m.role === "user") return m; // 条件判断
  } // 结束代码块
  return undefined; // 返回结果
} // 结束代码块

function hasTool(tools: ToolSpec[], name: string): boolean { // 定义函数
  return tools.some((t) => t.name === name); // 返回结果
} // 结束代码块

function newToolCall(name: string, args: Record<string, unknown>): ToolCall { // 定义函数
  return { id: crypto.randomUUID(), name, args }; // 返回结果
} // 结束代码块

function parseToolContent(content: string): unknown { // 定义函数
  try { // 开始异常捕获
    return JSON.parse(content); // 返回结果
  } catch { // 执行语句
    return content; // 返回结果
  } // 结束代码块
} // 结束代码块

function summarizeToolResult(toolName: string, parsed: unknown): string { // 定义函数
  if (toolName === "clock") { // 条件判断
    if (parsed && typeof parsed === "object" && "now" in (parsed as any)) { // 条件判断
      return `现在时间是 ${(parsed as any).now}`; // 返回结果
    } // 结束代码块
    return `现在时间是 ${String(parsed)}`; // 返回结果
  } // 结束代码块
  if (toolName === "math") { // 条件判断
    if (parsed && typeof parsed === "object" && "value" in (parsed as any)) { // 条件判断
      return `结果是 ${(parsed as any).value}`; // 返回结果
    } // 结束代码块
    return `结果是 ${String(parsed)}`; // 返回结果
  } // 结束代码块
  if (toolName === "echo") { // 条件判断
    if (parsed && typeof parsed === "object" && "text" in (parsed as any)) { // 条件判断
      return String((parsed as any).text); // 返回结果
    } // 结束代码块
    return String(parsed); // 返回结果
  } // 结束代码块
  return `工具 ${toolName} 返回：${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`; // 返回结果
} // 结束代码块

function extractExpression(text: string): string | null { // 定义函数
  const trimmed = text.trim(); // 声明常量
  const afterKeyword = trimmed.replace(/^计算\s*/u, ""); // 声明常量
  if (afterKeyword !== trimmed && afterKeyword.length > 0) return afterKeyword; // 条件判断
  const m = trimmed.match(/[0-9][0-9\s()+\-*/.]+/u); // 声明常量
  return m ? m[0].trim() : null; // 返回结果
} // 结束代码块

export class RuleBasedModel implements Model { // 导出类定义
  async generate(req: ModelRequest): Promise<ModelResponse> { // 执行语句
    const last = req.messages[req.messages.length - 1]; // 声明常量
    if (last && last.role === "tool") { // 条件判断
      const toolMsg = last as ToolMessage; // 声明常量
      const parsed = parseToolContent(toolMsg.content); // 声明常量
      return { content: summarizeToolResult(toolMsg.toolName, parsed) }; // 返回结果
    } // 结束代码块

    const user = lastUserMessage(req.messages); // 声明常量
    const text = user?.content ?? ""; // 声明常量

    const timeLike = /(\btime\b|几点|时间|现在几点)/iu.test(text); // 声明常量
    if (timeLike && hasTool(req.tools, "clock")) { // 条件判断
      return { toolCalls: [newToolCall("clock", {})] }; // 返回结果
    } // 结束代码块

    const expr = extractExpression(text); // 声明常量
    if (expr && hasTool(req.tools, "math")) { // 条件判断
      return { toolCalls: [newToolCall("math", { expression: expr })] }; // 返回结果
    } // 结束代码块

    return { content: `你说：${text}` }; // 返回结果
  } // 结束代码块
} // 结束代码块

