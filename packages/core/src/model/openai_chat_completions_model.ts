import type { ChatMessage } from "../chat/types";
import type { ToolSpec } from "../tool/types";
import type { Model, ModelRequest, ModelResponse, ToolCall } from "./types";
import { joinUrl, mergeBaseUrlAndApiPath } from "./openai_url";

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type OpenAIChatMessage =
  | { role: "system" | "user"; content: string }
  | {
      role: "assistant";
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; tool_call_id: string; content: string };

type OpenAIChatTool = {
  type: "function";
  function: { name: string; description?: string; parameters: unknown };
};

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function toolSpecToChatTool(spec: ToolSpec): OpenAIChatTool {
  return {
    type: "function",
    function: {
      name: spec.name,
      description: spec.description,
      parameters: spec.schema
    }
  };
}

function messagesToChatMessages(messages: ChatMessage[], instructions?: string): OpenAIChatMessage[] {
  const out: OpenAIChatMessage[] = [];
  if (instructions) out.push({ role: "system", content: instructions });

  for (const m of messages) {
    if (m.role === "system" || m.role === "user") {
      out.push({ role: m.role, content: m.content });
      continue;
    }
    if (m.role === "assistant") {
      const anyM = m as any;
      const toolCalls = Array.isArray(anyM.toolCalls) ? (anyM.toolCalls as any[]) : [];
      if (toolCalls.length > 0) {
        out.push({
          role: "assistant",
          content: anyM.content ?? null,
          tool_calls: toolCalls
            .filter((tc) => tc && typeof tc.id === "string" && typeof tc.name === "string")
            .map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: JSON.stringify(tc.args ?? {}) }
            }))
        });
      } else {
        out.push({ role: "assistant", content: String(anyM.content ?? "") });
      }
      continue;
    }
    if (m.role === "tool") {
      out.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content });
      continue;
    }
  }
  return out;
}

function extractAssistantContent(json: any): string {
  const msg = json?.choices?.[0]?.message;
  const content = msg?.content;
  return typeof content === "string" ? content : "";
}

function extractToolCalls(json: any): ToolCall[] {
  const msg = json?.choices?.[0]?.message;
  const tc = msg?.tool_calls;
  if (!Array.isArray(tc)) return [];
  const toolCalls: ToolCall[] = [];
  for (const item of tc) {
    const id = item?.id;
    const fn = item?.function;
    const name = fn?.name;
    const argsText = fn?.arguments;
    if (typeof id !== "string" || typeof name !== "string" || typeof argsText !== "string") continue;
    const parsed = safeJsonParse(argsText);
    toolCalls.push({
      id,
      name,
      args: (parsed && typeof parsed === "object" ? (parsed as any) : {}) as Record<string, unknown>
    });
  }
  return toolCalls;
}

export class OpenAIChatCompletionsModel implements Model {
  #apiKey: string;
  #model: string;
  #baseUrl: string;
  #apiPath: string;
  #instructions?: string;
  #fetch: FetchLike;

  constructor(opts: {
    apiKey: string;
    model: string;
    baseUrl?: string;
    apiPath?: string;
    instructions?: string;
    fetch?: FetchLike;
  }) {
    this.#apiKey = opts.apiKey;
    this.#model = opts.model;
    const merged = mergeBaseUrlAndApiPath(opts.baseUrl ?? "https://api.openai.com", opts.apiPath ?? "/v1");
    this.#baseUrl = merged.baseUrl;
    this.#apiPath = merged.apiPath;
    this.#instructions = opts.instructions;
    this.#fetch = opts.fetch ?? fetch;
  }

  async generate(req: ModelRequest): Promise<ModelResponse> {
    const url = joinUrl(this.#baseUrl, `${this.#apiPath}/chat/completions`);
    const body = {
      model: this.#model,
      messages: messagesToChatMessages(req.messages, this.#instructions),
      tools: req.tools.map(toolSpecToChatTool)
    };

    const resp = await this.#fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.#apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
      signal: req.signal
    });

    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`OpenAIChatCompletionsModel: HTTP ${resp.status} ${resp.statusText}: ${text}`);
    }

    const json = safeJsonParse(text) as any;
    const toolCalls = extractToolCalls(json);
    if (toolCalls.length > 0) return { toolCalls };

    return { content: extractAssistantContent(json) };
  }
}

