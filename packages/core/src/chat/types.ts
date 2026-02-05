// Chat 消息类型定义

export type ChatRole = "system" | "user" | "assistant" | "tool"; // 导出类型定义

export type SystemMessage = { role: "system"; content: string }; // 导出类型定义
export type UserMessage = { role: "user"; content: string }; // 导出类型定义
export type AssistantMessage = { role: "assistant"; content: string }; // 导出类型定义
export type AssistantToolCallsMessage = { // 导出类型定义
  role: "assistant"; // 执行语句
  content: string; // 执行语句
  toolCalls: Array<{ id: string; name: string; args: Record<string, unknown> }>; // 执行语句
}; // 结束代码块
export type ToolMessage = { // 导出类型定义
  role: "tool"; // 执行语句
  toolName: string; // 执行语句
  toolCallId: string; // 执行语句
  content: string; // 执行语句
}; // 结束代码块

export type ChatMessage = // 导出类型定义
  | SystemMessage // 执行语句
  | UserMessage // 执行语句
  | AssistantMessage // 执行语句
  | AssistantToolCallsMessage // 执行语句
  | ToolMessage; // 执行语句
