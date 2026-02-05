// ChatSession：单回合执行循环与事件流

import type { ChatMessage } from "./types"; // 导入类型依赖
import type { Model } from "../model/types"; // 导入类型依赖
import type { Tool } from "../tool/types"; // 导入类型依赖
import type { RunnerEvent } from "../events/types"; // 导入类型依赖

export type ChatSessionOptions = { // 导出类型定义
  model: Model; // 执行语句
  tools: Tool[]; // 执行语句
  runner?: { maxToolIters?: number; emitTrace?: boolean }; // 执行语句
  toolContext?: { now?: () => Date }; // 执行语句
}; // 结束代码块

export type TurnResult = // 导出类型定义
  | { // 执行语句
      ok: true; // 执行语句
      turnId: string; // 执行语句
      messages: ChatMessage[]; // 执行语句
      events: RunnerEvent[]; // 执行语句
      assistantMessage: string; // 执行语句
    } // 结束代码块
  | { // 执行语句
      ok: false; // 执行语句
      turnId: string; // 执行语句
      messages: ChatMessage[]; // 执行语句
      events: RunnerEvent[]; // 执行语句
      error: { message: string }; // 执行语句
    }; // 结束代码块

export class ChatSession { // 导出类定义
  #model: Model; // 执行语句
  #tools: Tool[]; // 执行语句
  #messages: ChatMessage[]; // 执行语句
  #maxToolIters: number; // 执行语句
  #emitTrace: boolean; // 执行语句
  #toolNow?: () => Date; // 执行语句

  constructor(options: ChatSessionOptions) { // 定义构造函数
    this.#model = options.model; // 执行语句
    this.#tools = options.tools; // 执行语句
    this.#messages = []; // 执行语句
    this.#maxToolIters = options.runner?.maxToolIters ?? 8; // 执行语句
    this.#emitTrace = options.runner?.emitTrace ?? true; // 执行语句
    this.#toolNow = options.toolContext?.now; // 执行语句
  } // 结束代码块

  get messages(): ChatMessage[] { // 执行语句
    return [...this.#messages]; // 返回结果
  } // 结束代码块

  async runTurn( // 执行语句
    userMessage: string, // 执行语句
    opts?: { onEvent?: (e: RunnerEvent) => void; signal?: AbortSignal } // 执行语句
  ): Promise<TurnResult> { // 执行语句
    const turnId = crypto.randomUUID(); // 声明常量
    const events: RunnerEvent[] = []; // 声明常量
    const toolsByName = new Map(this.#tools.map((t) => [t.spec.name, t] as const)); // 声明常量
    const toolSpecs = this.#tools.map((t) => t.spec); // 声明常量

    const emit = (e: RunnerEvent) => { // 声明常量
      if (!this.#emitTrace) return; // 条件判断
      events.push(e); // 执行语句
      opts?.onEvent?.(e); // 执行语句
    }; // 结束代码块

    const at = () => Date.now(); // 声明常量

    try { // 开始异常捕获
      this.#messages.push({ role: "user", content: userMessage }); // 执行语句
      emit({ type: "turn_started", turnId, userMessage, at: at() }); // 执行语句

      let toolCallsExecuted = 0; // 声明变量
      while (true) { // 循环条件
        emit({ type: "model_started", turnId, at: at() }); // 执行语句
        const response = await this.#model.generate({ // 声明常量
          messages: this.#messages, // 执行语句
          tools: toolSpecs, // 执行语句
          signal: opts?.signal // 执行语句
        }); // 结束代码块
        emit({ type: "model_completed", turnId, response, at: at() }); // 执行语句

        if (response.toolCalls && response.toolCalls.length > 0) { // 条件判断
          this.#messages.push({ // 执行语句
            role: "assistant", // 执行语句
            content: response.content ?? "", // 执行语句
            toolCalls: response.toolCalls // 执行语句
          }); // 结束代码块
          for (const toolCall of response.toolCalls) { // 循环遍历
            toolCallsExecuted++; // 执行语句
            if (toolCallsExecuted > this.#maxToolIters) { // 条件判断
              throw new Error(`maxToolIters exceeded (${this.#maxToolIters})`); // 抛出错误
            } // 结束代码块

            const tool = toolsByName.get(toolCall.name); // 声明常量
            if (!tool) { // 条件判断
              throw new Error(`Tool not found: ${toolCall.name}`); // 抛出错误
            } // 结束代码块

            emit({ type: "tool_started", turnId, toolCall, at: at() }); // 执行语句
            try { // 开始异常捕获
              const result = await tool.run(toolCall.args, { // 声明常量
                signal: opts?.signal, // 执行语句
                now: this.#toolNow // 执行语句
              }); // 结束代码块
              emit({ // 执行语句
                type: "tool_completed", // 执行语句
                turnId, // 执行语句
                toolCallId: toolCall.id, // 执行语句
                toolName: toolCall.name, // 执行语句
                result, // 执行语句
                at: at() // 执行语句
              }); // 结束代码块
              this.#messages.push({ // 执行语句
                role: "tool", // 执行语句
                toolName: toolCall.name, // 执行语句
                toolCallId: toolCall.id, // 执行语句
                content: JSON.stringify(result) // 执行语句
              }); // 结束代码块
            } catch (err) { // 执行语句
              const message = err instanceof Error ? err.message : String(err); // 声明常量
              emit({ // 执行语句
                type: "tool_failed", // 执行语句
                turnId, // 执行语句
                toolCallId: toolCall.id, // 执行语句
                toolName: toolCall.name, // 执行语句
                error: { message }, // 执行语句
                at: at() // 执行语句
              }); // 结束代码块
              throw new Error(`Tool failed (${toolCall.name}): ${message}`); // 抛出错误
            } // 结束代码块
          } // 结束代码块
          continue; // 继续下一轮
        } // 结束代码块

        const assistantMessage = response.content ?? ""; // 声明常量
        this.#messages.push({ role: "assistant", content: assistantMessage }); // 执行语句
        emit({ type: "turn_completed", turnId, assistantMessage, at: at() }); // 执行语句
        return { ok: true, turnId, messages: this.messages, events, assistantMessage }; // 返回结果
      } // 结束代码块
    } catch (err) { // 执行语句
      const message = err instanceof Error ? err.message : String(err); // 声明常量
      emit({ type: "turn_failed", turnId, error: { message }, at: at() }); // 执行语句
      return { ok: false, turnId, messages: this.messages, events, error: { message } }; // 返回结果
    } // 结束代码块
  } // 结束代码块
} // 结束代码块

export function createChatSession(options: ChatSessionOptions): ChatSession { // 导出函数定义
  return new ChatSession(options); // 返回结果
} // 结束代码块
