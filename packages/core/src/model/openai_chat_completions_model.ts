// OpenAI Chat Completions API 适配模型

import type { ChatMessage } from "../chat/types"; // 导入类型依赖
import type { ToolSpec } from "../tool/types"; // 导入类型依赖
import type { Model, ModelRequest, ModelResponse, ToolCall } from "./types"; // 导入类型依赖
import { joinUrl, mergeBaseUrlAndApiPath } from "./openai_url"; // 导入依赖

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>; // 定义类型

type OpenAIChatMessage = // 定义类型
  | { role: "system" | "user"; content: string } // 执行语句
  | { // 执行语句
      role: "assistant"; // 执行语句
      content: string | null; // 执行语句
      tool_calls?: Array<{ // 执行语句
        id: string; // 执行语句
        type: "function"; // 执行语句
        function: { name: string; arguments: string }; // 执行语句
      }>; // 执行语句
    } // 结束代码块
  | { role: "tool"; tool_call_id: string; content: string }; // 执行语句

type OpenAIChatTool = { // 定义类型
  type: "function"; // 执行语句
  function: { name: string; description?: string; parameters: unknown }; // 执行语句
}; // 结束代码块

function safeJsonParse(text: string): unknown { // 定义函数
  try { // 开始异常捕获
    return JSON.parse(text); // 返回结果
  } catch { // 执行语句
    return undefined; // 返回结果
  } // 结束代码块
} // 结束代码块

function toolSpecToChatTool(spec: ToolSpec): OpenAIChatTool { // 定义函数
  return { // 返回结果
    type: "function", // 执行语句
    function: { // 执行语句
      name: spec.name, // 执行语句
      description: spec.description, // 执行语句
      parameters: spec.schema // 执行语句
    } // 结束代码块
  }; // 结束代码块
} // 结束代码块

function messagesToChatMessages(messages: ChatMessage[], instructions?: string): OpenAIChatMessage[] { // 定义函数
  const out: OpenAIChatMessage[] = []; // 声明常量
  if (instructions) out.push({ role: "system", content: instructions }); // 条件判断

  for (const m of messages) { // 循环遍历
    if (m.role === "system" || m.role === "user") { // 条件判断
      out.push({ role: m.role, content: m.content }); // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
    if (m.role === "assistant") { // 条件判断
      const anyM = m as any; // 声明常量
      const toolCalls = Array.isArray(anyM.toolCalls) ? (anyM.toolCalls as any[]) : []; // 声明常量
      if (toolCalls.length > 0) { // 条件判断
        out.push({ // 执行语句
          role: "assistant", // 执行语句
          content: anyM.content ?? null, // 执行语句
          tool_calls: toolCalls // 执行语句
            .filter((tc) => tc && typeof tc.id === "string" && typeof tc.name === "string") // 执行语句
            .map((tc) => ({ // 执行语句
              id: tc.id, // 执行语句
              type: "function" as const, // 执行语句
              function: { name: tc.name, arguments: JSON.stringify(tc.args ?? {}) } // 执行语句
            })) // 结束代码块
        }); // 结束代码块
      } else { // 执行语句
        out.push({ role: "assistant", content: String(anyM.content ?? "") }); // 执行语句
      } // 结束代码块
      continue; // 继续下一轮
    } // 结束代码块
    if (m.role === "tool") { // 条件判断
      out.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content }); // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
  } // 结束代码块
  return out; // 返回结果
} // 结束代码块

function extractAssistantContent(json: any): string { // 定义函数
  const msg = json?.choices?.[0]?.message; // 声明常量
  const content = msg?.content; // 声明常量
  return typeof content === "string" ? content : ""; // 返回结果
} // 结束代码块

function extractToolCalls(json: any): ToolCall[] { // 定义函数
  const msg = json?.choices?.[0]?.message; // 声明常量
  const tc = msg?.tool_calls; // 声明常量
  if (!Array.isArray(tc)) return []; // 条件判断
  const toolCalls: ToolCall[] = []; // 声明常量
  for (const item of tc) { // 循环遍历
    const id = item?.id; // 声明常量
    const fn = item?.function; // 声明常量
    const name = fn?.name; // 声明常量
    const argsText = fn?.arguments; // 声明常量
    if (typeof id !== "string" || typeof name !== "string" || typeof argsText !== "string") continue; // 条件判断
    const parsed = safeJsonParse(argsText); // 声明常量
    toolCalls.push({ // 执行语句
      id, // 执行语句
      name, // 执行语句
      args: (parsed && typeof parsed === "object" ? (parsed as any) : {}) as Record<string, unknown> // 执行语句
    }); // 结束代码块
  } // 结束代码块
  return toolCalls; // 返回结果
} // 结束代码块

export class OpenAIChatCompletionsModel implements Model { // 导出类定义
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
    const url = joinUrl(this.#baseUrl, `${this.#apiPath}/chat/completions`); // 声明常量
    const body = { // 声明常量
      model: this.#model, // 执行语句
      messages: messagesToChatMessages(req.messages, this.#instructions), // 执行语句
      tools: req.tools.map(toolSpecToChatTool) // 执行语句
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
      throw new Error(`OpenAIChatCompletionsModel: HTTP ${resp.status} ${resp.statusText}: ${text}`); // 抛出错误
    } // 结束代码块

    const json = safeJsonParse(text) as any; // 声明常量
    const toolCalls = extractToolCalls(json); // 声明常量
    if (toolCalls.length > 0) return { toolCalls }; // 条件判断

    return { content: extractAssistantContent(json) }; // 返回结果
  } // 结束代码块
} // 结束代码块

