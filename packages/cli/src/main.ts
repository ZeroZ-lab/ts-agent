#!/usr/bin/env bun

import { loadConfig } from "./config";
import { runOnce } from "./commands/run";
import { runTuiCommand } from "./commands/tui";

function printHelp() {
  process.stdout.write(
    [
      "ts-agent",
      "",
      "Usage:",
      "  ts-agent tui",
      "  ts-agent run \"...\"",
      "",
      "Examples:",
      "  ts-agent run \"现在几点\"",
      "  ts-agent run \"计算 1+2*3\""
    ].join("\n") + "\n"
  );
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] ?? "tui";

  if (cmd === "-h" || cmd === "--help") {
    printHelp();
    return;
  }

  const config = await loadConfig();

  if (cmd === "tui") {
    await runTuiCommand(config);
    return;
  }

  if (cmd === "run") {
    const prompt = args.slice(1).join(" ").trim();
    if (!prompt) {
      printHelp();
      process.exitCode = 2;
      return;
    }
    process.exitCode = await runOnce(prompt, config);
    return;
  }

  printHelp();
  process.exitCode = 2;
}

await main();

