// ts-agent 配置类型定义

export type TsAgentConfig = { // 导出类型定义
  model: // 执行语句
    | { kind: "rule" } // 执行语句
    | { // 执行语句
        kind: "scripted"; // 执行语句
        script: Array<{ content?: string; toolCalls?: Array<{ id: string; name: string; args: any }> }>; // 执行语句
      } // 结束代码块
    | { // 执行语句
        kind: "openai"; // 执行语句
        model: string; // 执行语句
        api?: "responses" | "chat_completions"; // 执行语句
        apiKeyEnv?: string; // 执行语句
        baseUrl?: string; // 执行语句
        apiPath?: string; // 执行语句
        instructions?: string; // 执行语句
      }; // 结束代码块
  tools: { builtins: true }; // 执行语句
  runner: { maxToolIters: number; emitTrace: boolean }; // 执行语句
  tui: { transcriptMaxLines: number }; // 执行语句
}; // 结束代码块
