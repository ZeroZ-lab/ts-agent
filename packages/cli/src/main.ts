#!/usr/bin/env bun
// CLI 入口：解析命令并调度 run/tui

import { loadConfig } from "./config"; // 导入依赖
import { runOnce } from "./commands/run"; // 导入依赖
import { runTuiCommand } from "./commands/tui"; // 导入依赖

function printHelp() { // 定义函数
  process.stdout.write( // 输出到标准输出
    [ // 执行语句
      "ts-agent", // 执行语句
      "", // 执行语句
      "Usage:", // 执行语句
      "  ts-agent tui", // 执行语句
      "  ts-agent run \"...\"", // 执行语句
      "", // 执行语句
      "Examples:", // 执行语句
      "  ts-agent run \"现在几点\"", // 执行语句
      "  ts-agent run \"计算 1+2*3\"" // 执行语句
    ].join("\n") + "\n" // 执行语句
  ); // 结束代码块
} // 结束代码块

async function main() { // 定义异步函数
  const args = process.argv.slice(2); // 声明常量
  const cmd = args[0] ?? "tui"; // 声明常量

  if (cmd === "-h" || cmd === "--help") { // 条件判断
    printHelp(); // 执行语句
    return; // 返回结果
  } // 结束代码块

  const config = await loadConfig(); // 声明常量

  if (cmd === "tui") { // 条件判断
    await runTuiCommand(config); // 等待异步结果
    return; // 返回结果
  } // 结束代码块

  if (cmd === "run") { // 条件判断
    const prompt = args.slice(1).join(" ").trim(); // 声明常量
    if (!prompt) { // 条件判断
      printHelp(); // 执行语句
      process.exitCode = 2; // 设置退出码
      return; // 返回结果
    } // 结束代码块
    process.exitCode = await runOnce(prompt, config); // 设置退出码
    return; // 返回结果
  } // 结束代码块

  printHelp(); // 执行语句
  process.exitCode = 2; // 设置退出码
} // 结束代码块

await main(); // 等待异步结果

