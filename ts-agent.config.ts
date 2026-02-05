import type { TsAgentConfig } from "@ts-agent/core";

function cleanEnv(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const quoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"));
  return quoted ? trimmed.slice(1, -1).trim() : trimmed;
}

const openaiModel = cleanEnv(process.env.OPENAI_MODEL);
const openaiBaseUrl = cleanEnv(process.env.OPENAI_BASE_URL);
const openaiApi = cleanEnv(process.env.OPENAI_API);
const openaiApiPath = cleanEnv(process.env.OPENAI_API_PATH);
if (openaiBaseUrl && !/^https?:\/\//u.test(openaiBaseUrl)) {
  throw new Error(`Invalid OPENAI_BASE_URL: ${openaiBaseUrl} (expected http(s)://...)`);
}

const config = {
  model: {
    kind: "openai",
    model: openaiModel ?? "glm-4.7",
    api: openaiApi === "chat_completions" ? "chat_completions" : "responses",
    apiKeyEnv: "OPENAI_API_KEY",
    baseUrl: openaiBaseUrl,
    apiPath: openaiApiPath
  },
  tools: { builtins: true },
  runner: { maxToolIters: 8, emitTrace: true },
  tui: { transcriptMaxLines: 400 }
} satisfies TsAgentConfig;

export default config;
