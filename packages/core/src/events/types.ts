// Runner 事件类型定义

import type { ModelResponse, ToolCall } from "../model/types"; // 导入类型依赖

export type RunnerEvent = // 导出类型定义
  | { // 执行语句
      type: "turn_started"; // 执行语句
      turnId: string; // 执行语句
      userMessage: string; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "model_started"; // 执行语句
      turnId: string; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "model_completed"; // 执行语句
      turnId: string; // 执行语句
      response: ModelResponse; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "tool_started"; // 执行语句
      turnId: string; // 执行语句
      toolCall: ToolCall; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "tool_completed"; // 执行语句
      turnId: string; // 执行语句
      toolCallId: string; // 执行语句
      toolName: string; // 执行语句
      result: unknown; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "tool_failed"; // 执行语句
      turnId: string; // 执行语句
      toolCallId: string; // 执行语句
      toolName: string; // 执行语句
      error: { message: string }; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "turn_completed"; // 执行语句
      turnId: string; // 执行语句
      assistantMessage: string; // 执行语句
      at: number; // 执行语句
    } // 结束代码块
  | { // 执行语句
      type: "turn_failed"; // 执行语句
      turnId: string; // 执行语句
      error: { message: string }; // 执行语句
      at: number; // 执行语句
    }; // 结束代码块

