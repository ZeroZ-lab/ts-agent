// TUI 顶部提示文案生成

import type { TsAgentConfig } from "@ts-agent/core"; // 导入类型依赖

export function bannerLines(config: TsAgentConfig): string[] { // 导出函数定义
  const lines: string[] = ["欢迎使用 ts-agent（Ctrl+C 退出）"]; // 声明常量

  const kind = config.model.kind; // 声明常量
  if (kind === "rule") { // 条件判断
    lines.push("当前模型：rule（演示模式，只会复述/调用内置工具）"); // 执行语句
    lines.push("要接入 OpenAI：ts-agent.config.ts 设置 model.kind='openai' 并配置 OPENAI_API_KEY"); // 执行语句
    return lines; // 返回结果
  } // 结束代码块

  if (kind === "scripted") { // 条件判断
    lines.push("当前模型：scripted（脚本回放）"); // 执行语句
    return lines; // 返回结果
  } // 结束代码块

  // openai
  const api = config.model.api ?? "responses"; // 声明常量
  lines.push(`当前模型：openai / ${config.model.model} (${api})`); // 执行语句
  if (config.model.baseUrl) lines.push(`Base URL：${config.model.baseUrl}`); // 条件判断
  if (config.model.apiPath) lines.push(`API Path：${config.model.apiPath}`); // 条件判断
  return lines; // 返回结果
} // 结束代码块
