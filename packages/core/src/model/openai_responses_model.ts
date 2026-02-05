import type { ChatMessage } from "../chat/types";
import type { ToolSpec } from "../tool/types";
import type { Model, ModelRequest, ModelResponse, ToolCall } from "./types";
import { joinUrl, mergeBaseUrlAndApiPath } from "./openai_url";

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type OpenAIInputItem =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      type: "function_call";
      id: string;
      call_id: string;
      name: string;
      arguments: string;
    }
  | { type: "function_call_output"; call_id: string; output: string };

type OpenAIResponseOutputItem =
  | {
      type: "message";
      role: "assistant";
      content: Array<{ type: "output_text"; text: string } | { type: string; [k: string]: unknown }>;
    }
  | { type: "function_call"; id?: string; call_id: string; name: string; arguments: string }
  | { type: string; [k: string]: unknown };

function toolSpecToOpenAITool(spec: ToolSpec) {
  return {
    type: "function",
    name: spec.name,
    description: spec.description,
    parameters: spec.schema,
    strict: false
  };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function extractAssistantText(output: OpenAIResponseOutputItem[]): string {
  const parts: string[] = [];
  for (const item of output) {
    if (item.type !== "message") continue;
    if ((item as any).role !== "assistant") continue;
    const content = (item as any).content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (c && typeof c === "object" && (c as any).type === "output_text" && typeof (c as any).text === "string") {
        parts.push((c as any).text);
      }
    }
  }
  return parts.join("");
}

function extractToolCalls(output: OpenAIResponseOutputItem[]): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  for (const item of output) {
    if (item.type !== "function_call") continue;
    const callId = (item as any).call_id;
    const name = (item as any).name;
    const argText = (item as any).arguments;
    if (typeof callId !== "string" || typeof name !== "string" || typeof argText !== "string") continue;
    const parsed = safeJsonParse(argText);
    toolCalls.push({
      id: callId,
      name,
      args: (parsed && typeof parsed === "object" ? (parsed as any) : {}) as Record<string, unknown>
    });
  }
  return toolCalls;
}

function messagesToInput(messages: ChatMessage[]): OpenAIInputItem[] {
  const input: OpenAIInputItem[] = [];
  for (const m of messages) {
    if (m.role === "system" || m.role === "user") {
      input.push({ role: m.role, content: m.content });
      continue;
    }
    if (m.role === "assistant") {
      const anyM = m as any;
      input.push({ role: "assistant", content: String(anyM.content ?? "") });
      if (Array.isArray(anyM.toolCalls)) {
        for (const tc of anyM.toolCalls as Array<{ id: string; name: string; args: Record<string, unknown> }>) {
          input.push({
            type: "function_call",
            id: `fc_${tc.id}`,
            call_id: tc.id,
            name: tc.name,
            arguments: JSON.stringify(tc.args ?? {})
          });
        }
      }
      continue;
    }
    if (m.role === "tool") {
      input.push({ type: "function_call_output", call_id: m.toolCallId, output: m.content });
      continue;
    }
  }
  return input;
}

export class OpenAIResponsesModel implements Model {
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
    const url = joinUrl(this.#baseUrl, `${this.#apiPath}/responses`);
    const body = {
      model: this.#model,
      instructions: this.#instructions,
      input: messagesToInput(req.messages),
      tools: req.tools.map(toolSpecToOpenAITool)
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
      throw new Error(`OpenAIResponsesModel: HTTP ${resp.status} ${resp.statusText}: ${text}`);
    }

    const json = safeJsonParse(text) as any;
    const output = (json && Array.isArray(json.output) ? (json.output as OpenAIResponseOutputItem[]) : []) ?? [];

    const toolCalls = extractToolCalls(output);
    if (toolCalls.length > 0) return { toolCalls };

    const content = extractAssistantText(output);
    return { content };
  }
}
