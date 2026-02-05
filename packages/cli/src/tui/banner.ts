import type { TsAgentConfig } from "@ts-agent/core";

export function bannerLines(config: TsAgentConfig): string[] {
  const lines: string[] = ["欢迎使用 ts-agent（Ctrl+C 退出）"];

  const kind = config.model.kind;
  if (kind === "rule") {
    lines.push("当前模型：rule（演示模式，只会复述/调用内置工具）");
    lines.push("要接入 OpenAI：ts-agent.config.ts 设置 model.kind='openai' 并配置 OPENAI_API_KEY");
    return lines;
  }

  if (kind === "scripted") {
    lines.push("当前模型：scripted（脚本回放）");
    return lines;
  }

  // openai
  const api = config.model.api ?? "responses";
  lines.push(`当前模型：openai / ${config.model.model} (${api})`);
  if (config.model.baseUrl) lines.push(`Base URL：${config.model.baseUrl}`);
  if (config.model.apiPath) lines.push(`API Path：${config.model.apiPath}`);
  return lines;
}
