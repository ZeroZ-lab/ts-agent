// 模型接口与类型定义

import type { ChatMessage } from "../chat/types"; // 导入类型依赖
import type { ToolSpec } from "../tool/types"; // 导入类型依赖

export type ToolCall = { // 导出类型定义
  id: string; // 执行语句
  name: string; // 执行语句
  args: Record<string, unknown>; // 执行语句
}; // 结束代码块

export type ModelRequest = { // 导出类型定义
  messages: ChatMessage[]; // 执行语句
  tools: ToolSpec[]; // 执行语句
  signal?: AbortSignal; // 执行语句
}; // 结束代码块

export type ModelResponse = { // 导出类型定义
  content?: string; // 执行语句
  toolCalls?: ToolCall[]; // 执行语句
}; // 结束代码块

export type Model = { // 导出类型定义
  generate(req: ModelRequest): Promise<ModelResponse>; // 执行语句
}; // 结束代码块

