// TUI 状态与 reducer（纯函数）

import type { RunnerEvent } from "@ts-agent/core"; // 导入类型依赖

export type TuiStatus = "idle" | "running"; // 导出类型定义

export type TuiState = { // 导出类型定义
  title: string; // 执行语句
  status: TuiStatus; // 执行语句
  input: string; // 执行语句
  transcript: string[]; // 执行语句
  transcriptMaxLines: number; // 执行语句
}; // 结束代码块

export type TuiAction = // 导出类型定义
  | { type: "input_append"; text: string } // 执行语句
  | { type: "input_backspace" } // 执行语句
  | { type: "input_clear" } // 执行语句
  | { type: "set_status"; status: TuiStatus } // 执行语句
  | { type: "append_lines"; lines: string[] } // 执行语句
  | { type: "append_event"; event: RunnerEvent }; // 执行语句

export function createInitialState(opts: { transcriptMaxLines: number }): TuiState { // 导出函数定义
  return { // 返回结果
    title: "ts-agent", // 执行语句
    status: "idle", // 执行语句
    input: "", // 执行语句
    transcript: [], // 执行语句
    transcriptMaxLines: opts.transcriptMaxLines // 执行语句
  }; // 结束代码块
} // 结束代码块

function formatEventLine(e: RunnerEvent): string[] { // 定义函数
  if (e.type === "turn_started") return [`> user: ${e.userMessage}`]; // 条件判断
  if (e.type === "tool_started") return [`* tool_started: ${e.toolCall.name}`]; // 条件判断
  if (e.type === "tool_completed") // 条件判断
    return [`* tool_completed: ${e.toolName} ${JSON.stringify(e.result)}`]; // 返回结果
  if (e.type === "tool_failed") return [`* tool_failed: ${e.toolName} ${e.error.message}`]; // 条件判断
  if (e.type === "turn_completed") return [`< assistant: ${e.assistantMessage}`]; // 条件判断
  if (e.type === "turn_failed") return [`! turn_failed: ${e.error.message}`]; // 条件判断
  if (e.type === "model_started") return [`* model_started`]; // 条件判断
  if (e.type === "model_completed") return [`* model_completed`]; // 条件判断
  return [`* ${e.type}`]; // 返回结果
} // 结束代码块

export function reducer(state: TuiState, action: TuiAction): TuiState { // 导出函数定义
  if (action.type === "input_append") return { ...state, input: state.input + action.text }; // 条件判断
  if (action.type === "input_backspace") return { ...state, input: state.input.slice(0, -1) }; // 条件判断
  if (action.type === "input_clear") return { ...state, input: "" }; // 条件判断
  if (action.type === "set_status") return { ...state, status: action.status }; // 条件判断
  if (action.type === "append_lines") { // 条件判断
    const transcript = [...state.transcript, ...action.lines]; // 声明常量
    const clipped = // 声明常量
      transcript.length > state.transcriptMaxLines // 执行语句
        ? transcript.slice(transcript.length - state.transcriptMaxLines) // 执行语句
        : transcript; // 执行语句
    return { ...state, transcript: clipped }; // 返回结果
  } // 结束代码块
  if (action.type === "append_event") { // 条件判断
    return reducer(state, { type: "append_lines", lines: formatEventLine(action.event) }); // 返回结果
  } // 结束代码块
  return state; // 返回结果
} // 结束代码块

