import type { ChatMessage, ToolMessage, UserMessage } from "../chat/types";
import type { ToolSpec } from "../tool/types";
import type { Model, ModelRequest, ModelResponse, ToolCall } from "./types";

function lastUserMessage(messages: ChatMessage[]): UserMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") return m;
  }
  return undefined;
}

function hasTool(tools: ToolSpec[], name: string): boolean {
  return tools.some((t) => t.name === name);
}

function newToolCall(name: string, args: Record<string, unknown>): ToolCall {
  return { id: crypto.randomUUID(), name, args };
}

function parseToolContent(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

function summarizeToolResult(toolName: string, parsed: unknown): string {
  if (toolName === "clock") {
    if (parsed && typeof parsed === "object" && "now" in (parsed as any)) {
      return `现在时间是 ${(parsed as any).now}`;
    }
    return `现在时间是 ${String(parsed)}`;
  }
  if (toolName === "math") {
    if (parsed && typeof parsed === "object" && "value" in (parsed as any)) {
      return `结果是 ${(parsed as any).value}`;
    }
    return `结果是 ${String(parsed)}`;
  }
  if (toolName === "echo") {
    if (parsed && typeof parsed === "object" && "text" in (parsed as any)) {
      return String((parsed as any).text);
    }
    return String(parsed);
  }
  return `工具 ${toolName} 返回：${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`;
}

function extractExpression(text: string): string | null {
  const trimmed = text.trim();
  const afterKeyword = trimmed.replace(/^计算\s*/u, "");
  if (afterKeyword !== trimmed && afterKeyword.length > 0) return afterKeyword;
  const m = trimmed.match(/[0-9][0-9\s()+\-*/.]+/u);
  return m ? m[0].trim() : null;
}

export class RuleBasedModel implements Model {
  async generate(req: ModelRequest): Promise<ModelResponse> {
    const last = req.messages[req.messages.length - 1];
    if (last && last.role === "tool") {
      const toolMsg = last as ToolMessage;
      const parsed = parseToolContent(toolMsg.content);
      return { content: summarizeToolResult(toolMsg.toolName, parsed) };
    }

    const user = lastUserMessage(req.messages);
    const text = user?.content ?? "";

    const timeLike = /(\btime\b|几点|时间|现在几点)/iu.test(text);
    if (timeLike && hasTool(req.tools, "clock")) {
      return { toolCalls: [newToolCall("clock", {})] };
    }

    const expr = extractExpression(text);
    if (expr && hasTool(req.tools, "math")) {
      return { toolCalls: [newToolCall("math", { expression: expr })] };
    }

    return { content: `你说：${text}` };
  }
}

