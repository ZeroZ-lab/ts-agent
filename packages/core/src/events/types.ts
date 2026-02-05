import type { ModelResponse, ToolCall } from "../model/types";

export type RunnerEvent =
  | {
      type: "turn_started";
      turnId: string;
      userMessage: string;
      at: number;
    }
  | {
      type: "model_started";
      turnId: string;
      at: number;
    }
  | {
      type: "model_completed";
      turnId: string;
      response: ModelResponse;
      at: number;
    }
  | {
      type: "tool_started";
      turnId: string;
      toolCall: ToolCall;
      at: number;
    }
  | {
      type: "tool_completed";
      turnId: string;
      toolCallId: string;
      toolName: string;
      result: unknown;
      at: number;
    }
  | {
      type: "tool_failed";
      turnId: string;
      toolCallId: string;
      toolName: string;
      error: { message: string };
      at: number;
    }
  | {
      type: "turn_completed";
      turnId: string;
      assistantMessage: string;
      at: number;
    }
  | {
      type: "turn_failed";
      turnId: string;
      error: { message: string };
      at: number;
    };

