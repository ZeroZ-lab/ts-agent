export type ChatRole = "system" | "user" | "assistant" | "tool";

export type SystemMessage = { role: "system"; content: string };
export type UserMessage = { role: "user"; content: string };
export type AssistantMessage = { role: "assistant"; content: string };
export type AssistantToolCallsMessage = {
  role: "assistant";
  content: string;
  toolCalls: Array<{ id: string; name: string; args: Record<string, unknown> }>;
};
export type ToolMessage = {
  role: "tool";
  toolName: string;
  toolCallId: string;
  content: string;
};

export type ChatMessage =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | AssistantToolCallsMessage
  | ToolMessage;
