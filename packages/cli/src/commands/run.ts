import {
  createChatSession,
  createBuiltinTools,
  OpenAIChatCompletionsModel,
  OpenAIResponsesModel,
  RuleBasedModel,
  ScriptedModel
} from "@ts-agent/core";
import type { TsAgentConfig } from "@ts-agent/core";

function createModelFromConfig(config: TsAgentConfig) {
  if (config.model.kind === "scripted") {
    return new ScriptedModel(config.model.script as any);
  }
  if (config.model.kind === "openai") {
    const envName = config.model.apiKeyEnv ?? "OPENAI_API_KEY";
    const apiKey = process.env[envName];
    if (!apiKey) {
      throw new Error(`Missing API key env: ${envName}`);
    }
    const api = config.model.api ?? "responses";
    const common = {
      apiKey,
      model: config.model.model,
      baseUrl: config.model.baseUrl,
      apiPath: config.model.apiPath,
      instructions: config.model.instructions
    };
    return api === "chat_completions" ? new OpenAIChatCompletionsModel(common) : new OpenAIResponsesModel(common);
  }
  return new RuleBasedModel();
}

export async function runOnce(prompt: string, config: TsAgentConfig): Promise<number> {
  try {
    const tools = config.tools.builtins ? createBuiltinTools() : [];
    const session = createChatSession({
      model: createModelFromConfig(config),
      tools,
      runner: config.runner
    });

    const result = await session.runTurn(prompt);
    if (config.runner.emitTrace) {
      for (const e of result.events) {
        process.stdout.write(`${e.type} ${JSON.stringify(e)}\n`);
      }
    }

    if (result.ok) {
      process.stdout.write(`${result.assistantMessage}\n`);
      return 0;
    }

    process.stderr.write(`ERROR: ${result.error.message}\n`);
    return 1;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${msg}\n`);
    return 1;
  }
}
