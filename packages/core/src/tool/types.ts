// 工具类型定义

export type ToolSpec = { // 导出类型定义
  name: string; // 执行语句
  description: string; // 执行语句
  schema: Record<string, unknown>; // 执行语句
}; // 结束代码块

export type ToolContext = { // 导出类型定义
  signal?: AbortSignal; // 执行语句
  now?: () => Date; // 执行语句
}; // 结束代码块

export type ToolResult = { // 导出类型定义
  content?: string; // 执行语句
  [k: string]: unknown; // 执行语句
}; // 结束代码块

export type Tool = { // 导出类型定义
  spec: ToolSpec; // 执行语句
  run(args: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult>; // 执行语句
}; // 结束代码块

