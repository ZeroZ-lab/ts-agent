import type { ChatMessage } from "./types";
import type { Model } from "../model/types";
import type { Tool } from "../tool/types";
import type { RunnerEvent } from "../events/types";

export type ChatSessionOptions = {
  model: Model;
  tools: Tool[];
  runner?: { maxToolIters?: number; emitTrace?: boolean };
  toolContext?: { now?: () => Date };
};

export type TurnResult =
  | {
      ok: true;
      turnId: string;
      messages: ChatMessage[];
      events: RunnerEvent[];
      assistantMessage: string;
    }
  | {
      ok: false;
      turnId: string;
      messages: ChatMessage[];
      events: RunnerEvent[];
      error: { message: string };
    };

export class ChatSession {
  #model: Model;
  #tools: Tool[];
  #messages: ChatMessage[];
  #maxToolIters: number;
  #emitTrace: boolean;
  #toolNow?: () => Date;

  constructor(options: ChatSessionOptions) {
    this.#model = options.model;
    this.#tools = options.tools;
    this.#messages = [];
    this.#maxToolIters = options.runner?.maxToolIters ?? 8;
    this.#emitTrace = options.runner?.emitTrace ?? true;
    this.#toolNow = options.toolContext?.now;
  }

  get messages(): ChatMessage[] {
    return [...this.#messages];
  }

  async runTurn(
    userMessage: string,
    opts?: { onEvent?: (e: RunnerEvent) => void; signal?: AbortSignal }
  ): Promise<TurnResult> {
    const turnId = crypto.randomUUID();
    const events: RunnerEvent[] = [];
    const toolsByName = new Map(this.#tools.map((t) => [t.spec.name, t] as const));
    const toolSpecs = this.#tools.map((t) => t.spec);

    const emit = (e: RunnerEvent) => {
      if (!this.#emitTrace) return;
      events.push(e);
      opts?.onEvent?.(e);
    };

    const at = () => Date.now();

    try {
      this.#messages.push({ role: "user", content: userMessage });
      emit({ type: "turn_started", turnId, userMessage, at: at() });

      let toolCallsExecuted = 0;
      while (true) {
        emit({ type: "model_started", turnId, at: at() });
        const response = await this.#model.generate({
          messages: this.#messages,
          tools: toolSpecs,
          signal: opts?.signal
        });
        emit({ type: "model_completed", turnId, response, at: at() });

        if (response.toolCalls && response.toolCalls.length > 0) {
          this.#messages.push({
            role: "assistant",
            content: response.content ?? "",
            toolCalls: response.toolCalls
          });
          for (const toolCall of response.toolCalls) {
            toolCallsExecuted++;
            if (toolCallsExecuted > this.#maxToolIters) {
              throw new Error(`maxToolIters exceeded (${this.#maxToolIters})`);
            }

            const tool = toolsByName.get(toolCall.name);
            if (!tool) {
              throw new Error(`Tool not found: ${toolCall.name}`);
            }

            emit({ type: "tool_started", turnId, toolCall, at: at() });
            try {
              const result = await tool.run(toolCall.args, {
                signal: opts?.signal,
                now: this.#toolNow
              });
              emit({
                type: "tool_completed",
                turnId,
                toolCallId: toolCall.id,
                toolName: toolCall.name,
                result,
                at: at()
              });
              this.#messages.push({
                role: "tool",
                toolName: toolCall.name,
                toolCallId: toolCall.id,
                content: JSON.stringify(result)
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : String(err);
              emit({
                type: "tool_failed",
                turnId,
                toolCallId: toolCall.id,
                toolName: toolCall.name,
                error: { message },
                at: at()
              });
              throw new Error(`Tool failed (${toolCall.name}): ${message}`);
            }
          }
          continue;
        }

        const assistantMessage = response.content ?? "";
        this.#messages.push({ role: "assistant", content: assistantMessage });
        emit({ type: "turn_completed", turnId, assistantMessage, at: at() });
        return { ok: true, turnId, messages: this.messages, events, assistantMessage };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      emit({ type: "turn_failed", turnId, error: { message }, at: at() });
      return { ok: false, turnId, messages: this.messages, events, error: { message } };
    }
  }
}

export function createChatSession(options: ChatSessionOptions): ChatSession {
  return new ChatSession(options);
}
