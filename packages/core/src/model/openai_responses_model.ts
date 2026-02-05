// OpenAI Responses API 适配模型

import type { ChatMessage } from "../chat/types"; // 导入类型依赖
import type { ToolSpec } from "../tool/types"; // 导入类型依赖
import type { Model, ModelRequest, ModelResponse, ToolCall } from "./types"; // 导入类型依赖
import { joinUrl, mergeBaseUrlAndApiPath } from "./openai_url"; // 导入依赖

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>; // 定义类型

type OpenAIInputItem = // 定义类型
  | { role: "system" | "user" | "assistant"; content: string } // 执行语句
  | { // 执行语句
      type: "function_call"; // 执行语句
      id: string; // 执行语句
      call_id: string; // 执行语句
      name: string; // 执行语句
      arguments: string; // 执行语句
    } // 结束代码块
  | { type: "function_call_output"; call_id: string; output: string }; // 执行语句

type OpenAIResponseOutputItem = // 定义类型
  | { // 执行语句
      type: "message"; // 执行语句
      role: "assistant"; // 执行语句
      content: Array<{ type: "output_text"; text: string } | { type: string; [k: string]: unknown }>; // 执行语句
    } // 结束代码块
  | { type: "function_call"; id?: string; call_id: string; name: string; arguments: string } // 执行语句
  | { type: string; [k: string]: unknown }; // 执行语句

function toolSpecToOpenAITool(spec: ToolSpec) { // 定义函数
  return { // 返回结果
    type: "function", // 执行语句
    name: spec.name, // 执行语句
    description: spec.description, // 执行语句
    parameters: spec.schema, // 执行语句
    strict: false // 执行语句
  }; // 结束代码块
} // 结束代码块

function safeJsonParse(text: string): unknown { // 定义函数
  try { // 开始异常捕获
    return JSON.parse(text); // 返回结果
  } catch { // 执行语句
    return undefined; // 返回结果
  } // 结束代码块
} // 结束代码块

function extractAssistantText(output: OpenAIResponseOutputItem[]): string { // 定义函数
  const parts: string[] = []; // 声明常量
  for (const item of output) { // 循环遍历
    if (item.type !== "message") continue; // 条件判断
    if ((item as any).role !== "assistant") continue; // 条件判断
    const content = (item as any).content; // 声明常量
    if (!Array.isArray(content)) continue; // 条件判断
    for (const c of content) { // 循环遍历
      if (c && typeof c === "object" && (c as any).type === "output_text" && typeof (c as any).text === "string") { // 条件判断
        parts.push((c as any).text); // 执行语句
      } // 结束代码块
    } // 结束代码块
  } // 结束代码块
  return parts.join(""); // 返回结果
} // 结束代码块

function extractToolCalls(output: OpenAIResponseOutputItem[]): ToolCall[] { // 定义函数
  const toolCalls: ToolCall[] = []; // 声明常量
  for (const item of output) { // 循环遍历
    if (item.type !== "function_call") continue; // 条件判断
    const callId = (item as any).call_id; // 声明常量
    const name = (item as any).name; // 声明常量
    const argText = (item as any).arguments; // 声明常量
    if (typeof callId !== "string" || typeof name !== "string" || typeof argText !== "string") continue; // 条件判断
    const parsed = safeJsonParse(argText); // 声明常量
    toolCalls.push({ // 执行语句
      id: callId, // 执行语句
      name, // 执行语句
      args: (parsed && typeof parsed === "object" ? (parsed as any) : {}) as Record<string, unknown> // 执行语句
    }); // 结束代码块
  } // 结束代码块
  return toolCalls; // 返回结果
} // 结束代码块

function messagesToInput(messages: ChatMessage[]): OpenAIInputItem[] { // 定义函数
  const input: OpenAIInputItem[] = []; // 声明常量
  for (const m of messages) { // 循环遍历
    if (m.role === "system" || m.role === "user") { // 条件判断
      input.push({ role: m.role, content: m.content }); // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
    if (m.role === "assistant") { // 条件判断
      const anyM = m as any; // 声明常量
      input.push({ role: "assistant", content: String(anyM.content ?? "") }); // 执行语句
      if (Array.isArray(anyM.toolCalls)) { // 条件判断
        for (const tc of anyM.toolCalls as Array<{ id: string; name: string; args: Record<string, unknown> }>) { // 循环遍历
          input.push({ // 执行语句
            type: "function_call", // 执行语句
            id: `fc_${tc.id}`, // 执行语句
            call_id: tc.id, // 执行语句
            name: tc.name, // 执行语句
            arguments: JSON.stringify(tc.args ?? {}) // 执行语句
          }); // 结束代码块
        } // 结束代码块
      } // 结束代码块
      continue; // 继续下一轮
    } // 结束代码块
    if (m.role === "tool") { // 条件判断
      input.push({ type: "function_call_output", call_id: m.toolCallId, output: m.content }); // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
  } // 结束代码块
  return input; // 返回结果
} // 结束代码块

export class OpenAIResponsesModel implements Model { // 导出类定义
  #apiKey: string; // 执行语句
  #model: string; // 执行语句
  #baseUrl: string; // 执行语句
  #apiPath: string; // 执行语句
  #instructions?: string; // 执行语句
  #fetch: FetchLike; // 执行语句

  constructor(opts: { // 定义构造函数
    apiKey: string; // 执行语句
    model: string; // 执行语句
    baseUrl?: string; // 执行语句
    apiPath?: string; // 执行语句
    instructions?: string; // 执行语句
    fetch?: FetchLike; // 执行语句
  }) { // 执行语句
    this.#apiKey = opts.apiKey; // 执行语句
    this.#model = opts.model; // 执行语句
    const merged = mergeBaseUrlAndApiPath(opts.baseUrl ?? "https://api.openai.com", opts.apiPath ?? "/v1"); // 声明常量
    this.#baseUrl = merged.baseUrl; // 执行语句
    this.#apiPath = merged.apiPath; // 执行语句
    this.#instructions = opts.instructions; // 执行语句
    this.#fetch = opts.fetch ?? fetch; // 执行语句
  } // 结束代码块

  async generate(req: ModelRequest): Promise<ModelResponse> { // 执行语句
    const url = joinUrl(this.#baseUrl, `${this.#apiPath}/responses`); // 声明常量
    const body = { // 声明常量
      model: this.#model, // 执行语句
      instructions: this.#instructions, // 执行语句
      input: messagesToInput(req.messages), // 执行语句
      tools: req.tools.map(toolSpecToOpenAITool) // 执行语句
    }; // 结束代码块

    const resp = await this.#fetch(url, { // 声明常量
      method: "POST", // 执行语句
      headers: { // 执行语句
        authorization: `Bearer ${this.#apiKey}`, // 执行语句
        "content-type": "application/json" // 执行语句
      }, // 执行语句
      body: JSON.stringify(body), // 执行语句
      signal: req.signal // 执行语句
    }); // 结束代码块

    const text = await resp.text(); // 声明常量
    if (!resp.ok) { // 条件判断
      throw new Error(`OpenAIResponsesModel: HTTP ${resp.status} ${resp.statusText}: ${text}`); // 抛出错误
    } // 结束代码块

    const json = safeJsonParse(text) as any; // 声明常量
    const output = (json && Array.isArray(json.output) ? (json.output as OpenAIResponseOutputItem[]) : []) ?? []; // 声明常量

    const toolCalls = extractToolCalls(output); // 声明常量
    if (toolCalls.length > 0) return { toolCalls }; // 条件判断

    const content = extractAssistantText(output); // 声明常量
    return { content }; // 返回结果
  } // 结束代码块
} // 结束代码块
