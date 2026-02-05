// TUI 控制器：键盘输入、事件分发与渲染驱动

import type { ChatSession, RunnerEvent } from "@ts-agent/core"; // 导入类型依赖
import type { TsAgentConfig } from "@ts-agent/core"; // 导入类型依赖
import { StringDecoder } from "node:string_decoder"; // 导入依赖
import { reducer, type TuiAction, createInitialState, type TuiState } from "./state"; // 导入依赖
import { render } from "./render"; // 导入依赖
import { bannerLines } from "./banner"; // 导入依赖

type Key = // 定义类型
  | { kind: "char"; value: string } // 执行语句
  | { kind: "enter" } // 执行语句
  | { kind: "backspace" } // 执行语句
  | { kind: "ctrl_c" } // 执行语句
  | { kind: "ctrl_l" }; // 执行语句

function decodeKeys(text: string): Key[] { // 定义函数
  const keys: Key[] = []; // 声明常量
  let inEscape = false; // 声明变量

  for (const ch of text) { // 循环遍历
    if (inEscape) { // 条件判断
      if (/[A-Za-z~]/u.test(ch)) inEscape = false; // 条件判断
      continue; // 继续下一轮
    } // 结束代码块
    if (ch === "\x1b") { // 条件判断
      inEscape = true; // 执行语句
      continue; // 继续下一轮
    } // 结束代码块

    if (ch === "\x03") keys.push({ kind: "ctrl_c" }); // 条件判断
    else if (ch === "\x0c") keys.push({ kind: "ctrl_l" }); // 否则条件判断
    else if (ch === "\r" || ch === "\n") keys.push({ kind: "enter" }); // 否则条件判断
    else if (ch === "\x7f") keys.push({ kind: "backspace" }); // 否则条件判断
    else if (ch >= " ") keys.push({ kind: "char", value: ch }); // 否则条件判断
  } // 结束代码块

  return keys; // 返回结果
} // 结束代码块

export async function runTui(opts: { // 执行语句
  session: ChatSession; // 执行语句
  config: TsAgentConfig; // 执行语句
}): Promise<void> { // 执行语句
  let state: TuiState = createInitialState({ transcriptMaxLines: opts.config.tui.transcriptMaxLines }); // 声明变量

  const dispatch = (action: TuiAction) => { // 声明常量
    state = reducer(state, action); // 执行语句
    process.stdout.write(render(state)); // 输出到标准输出
  }; // 结束代码块

  const appendEvent = (event: RunnerEvent) => dispatch({ type: "append_event", event }); // 声明常量

  const stdin = process.stdin; // 声明常量
  if (stdin.isTTY) stdin.setRawMode(true); // 条件判断
  stdin.resume(); // 执行语句
  const decoder = new StringDecoder("utf8"); // 声明常量

  const cleanup = () => { // 声明常量
    try { // 开始异常捕获
      if (stdin.isTTY) stdin.setRawMode(false); // 条件判断
      stdin.pause(); // 执行语句
    } catch { // 执行语句
      // ignore
    } // 结束代码块
    process.stdout.write("\x1b[2J\x1b[H\x1b[?25h"); // 输出到标准输出
  }; // 结束代码块

  process.on("SIGINT", () => { // 执行语句
    cleanup(); // 执行语句
    process.exit(0); // 执行语句
  }); // 结束代码块

  dispatch({ type: "append_lines", lines: bannerLines(opts.config) }); // 执行语句

  let running = false; // 声明变量
  const handleSend = async () => { // 声明常量
    const prompt = state.input.trim(); // 声明常量
    if (!prompt) return; // 条件判断
    dispatch({ type: "input_clear" }); // 执行语句
    dispatch({ type: "set_status", status: "running" }); // 执行语句
    running = true; // 执行语句
    try { // 开始异常捕获
      await opts.session.runTurn(prompt, { onEvent: appendEvent }); // 等待异步结果
    } finally { // 执行语句
      running = false; // 执行语句
      dispatch({ type: "set_status", status: "idle" }); // 执行语句
    } // 结束代码块
  }; // 结束代码块

  stdin.on("data", async (chunk: Buffer) => { // 执行语句
    const text = decoder.write(chunk); // 声明常量
    for (const key of decodeKeys(text)) { // 循环遍历
      if (key.kind === "ctrl_c") { // 条件判断
        cleanup(); // 执行语句
        process.exit(0); // 执行语句
      } // 结束代码块
      if (key.kind === "ctrl_l") { // 条件判断
        dispatch({ type: "append_lines", lines: ["(cleared)"] }); // 执行语句
        continue; // 继续下一轮
      } // 结束代码块
      if (running) continue; // 条件判断
      if (key.kind === "backspace") dispatch({ type: "input_backspace" }); // 条件判断
      else if (key.kind === "char") dispatch({ type: "input_append", text: key.value }); // 否则条件判断
      else if (key.kind === "enter") await handleSend(); // 否则条件判断
    } // 结束代码块
  }); // 结束代码块
} // 结束代码块
