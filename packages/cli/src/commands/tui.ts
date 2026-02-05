import {
  createChatSession,
  createBuiltinTools,
  OpenAIChatCompletionsModel,
  OpenAIResponsesModel,
  RuleBasedModel,
  ScriptedModel
} from "@ts-agent/core";
import type { TsAgentConfig } from "@ts-agent/core";
import { runTui } from "../tui/controller";

function createModelFromConfig(config: TsAgentConfig) {
  if (config.model.kind === "scripted") return new ScriptedModel(config.model.script as any);
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

export async function runTuiCommand(config: TsAgentConfig): Promise<void> {
  try {
    const tools = config.tools.builtins ? createBuiltinTools() : [];
    const session = createChatSession({
      model: createModelFromConfig(config),
      tools,
      runner: config.runner
    });
    await runTui({ session, config });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`ERROR: ${msg}\n`);
    process.exitCode = 1;
  }
}
