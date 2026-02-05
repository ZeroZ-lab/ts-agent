// TUI 渲染：将状态绘制为 ANSI 字符串

import type { TuiState } from "./state"; // 导入类型依赖

function clamp(n: number, min: number, max: number): number { // 定义函数
  return Math.max(min, Math.min(max, n)); // 返回结果
} // 结束代码块

export function render(state: TuiState, dims?: { columns: number; rows: number }): string { // 导出函数定义
  const columns = dims?.columns ?? process.stdout.columns ?? 80; // 声明常量
  const rows = dims?.rows ?? process.stdout.rows ?? 24; // 声明常量
  const header = `${state.title} [${state.status}]`; // 声明常量
  const prompt = `> ${state.input}`; // 声明常量

  const usableRows = clamp(rows - 3, 1, rows); // 声明常量
  const transcriptLines = state.transcript.slice(-usableRows); // 声明常量

  const pad = (s: string) => (s.length > columns ? s.slice(0, Math.max(0, columns - 1)) : s); // 声明常量
  const body = transcriptLines.map(pad).join("\n"); // 声明常量

  return [ // 返回结果
    "\x1b[?25l", // hide cursor // 执行语句
    "\x1b[2J\x1b[H", // clear + home // 执行语句
    pad(header), // 执行语句
    "", // 执行语句
    body, // 执行语句
    "", // 执行语句
    pad(prompt), // 执行语句
    "\x1b[?25h" // show cursor // 执行语句
  ].join("\n"); // 执行语句
} // 结束代码块

