import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import type { TsAgentConfig } from "@ts-agent/core";

export function defaultConfig(): TsAgentConfig {
  return {
    model: { kind: "rule" },
    tools: { builtins: true },
    runner: { maxToolIters: 8, emitTrace: true },
    tui: { transcriptMaxLines: 400 }
  };
}

export async function loadConfig(opts?: { cwd?: string }): Promise<TsAgentConfig> {
  const cwd = opts?.cwd ?? process.cwd();
  const candidates = ["ts-agent.config.ts", "ts-agent.config.js"];
  for (const name of candidates) {
    const file = join(cwd, name);
    if (!existsSync(file)) continue;
    const mod = await import(pathToFileURL(file).href);
    const loaded = (mod as any).default ?? mod;
    return {
      ...defaultConfig(),
      ...loaded,
      runner: { ...defaultConfig().runner, ...(loaded.runner ?? {}) },
      tui: { ...defaultConfig().tui, ...(loaded.tui ?? {}) },
      tools: { ...defaultConfig().tools, ...(loaded.tools ?? {}) },
      model: loaded.model ?? defaultConfig().model
    } as TsAgentConfig;
  }
  return defaultConfig();
}

