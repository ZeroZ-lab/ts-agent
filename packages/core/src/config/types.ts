export type TsAgentConfig = {
  model:
    | { kind: "rule" }
    | {
        kind: "scripted";
        script: Array<{ content?: string; toolCalls?: Array<{ id: string; name: string; args: any }> }>;
      }
    | {
        kind: "openai";
        model: string;
        api?: "responses" | "chat_completions";
        apiKeyEnv?: string;
        baseUrl?: string;
        apiPath?: string;
        instructions?: string;
      };
  tools: { builtins: true };
  runner: { maxToolIters: number; emitTrace: boolean };
  tui: { transcriptMaxLines: number };
};
