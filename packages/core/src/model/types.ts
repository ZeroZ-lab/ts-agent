import type { ChatMessage } from "../chat/types";
import type { ToolSpec } from "../tool/types";

export type ToolCall = {
  id: string;
  name: string;
  args: Record<string, unknown>;
};

export type ModelRequest = {
  messages: ChatMessage[];
  tools: ToolSpec[];
  signal?: AbortSignal;
};

export type ModelResponse = {
  content?: string;
  toolCalls?: ToolCall[];
};

export type Model = {
  generate(req: ModelRequest): Promise<ModelResponse>;
};

