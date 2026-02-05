// CLI 配置加载与默认配置定义

import { existsSync } from "node:fs"; // 导入依赖
import { pathToFileURL } from "node:url"; // 导入依赖
import { join } from "node:path"; // 导入依赖
import type { TsAgentConfig } from "@ts-agent/core"; // 导入类型依赖

export function defaultConfig(): TsAgentConfig { // 导出函数定义
  return { // 返回结果
    model: { kind: "rule" }, // 执行语句
    tools: { builtins: true }, // 执行语句
    runner: { maxToolIters: 8, emitTrace: true }, // 执行语句
    tui: { transcriptMaxLines: 400 } // 执行语句
  }; // 结束代码块
} // 结束代码块

export async function loadConfig(opts?: { cwd?: string }): Promise<TsAgentConfig> { // 执行语句
  const cwd = opts?.cwd ?? process.cwd(); // 声明常量
  const candidates = ["ts-agent.config.ts", "ts-agent.config.js"]; // 声明常量
  for (const name of candidates) { // 循环遍历
    const file = join(cwd, name); // 声明常量
    if (!existsSync(file)) continue; // 条件判断
    const mod = await import(pathToFileURL(file).href); // 声明常量
    const loaded = (mod as any).default ?? mod; // 声明常量
    return { // 返回结果
      ...defaultConfig(), // 执行语句
      ...loaded, // 执行语句
      runner: { ...defaultConfig().runner, ...(loaded.runner ?? {}) }, // 执行语句
      tui: { ...defaultConfig().tui, ...(loaded.tui ?? {}) }, // 执行语句
      tools: { ...defaultConfig().tools, ...(loaded.tools ?? {}) }, // 执行语句
      model: loaded.model ?? defaultConfig().model // 执行语句
    } as TsAgentConfig; // 执行语句
  } // 结束代码块
  return defaultConfig(); // 返回结果
} // 结束代码块

