import { describe, expect, test } from "bun:test";
import { bannerLines } from "./banner";

describe("TUI banner", () => {
  test("rule model shows OpenAI hint", () => {
    const lines = bannerLines({
      model: { kind: "rule" },
      tools: { builtins: true },
      runner: { maxToolIters: 8, emitTrace: true },
      tui: { transcriptMaxLines: 10 }
    });
    expect(lines.join("\n")).toContain("当前模型：rule");
    expect(lines.join("\n")).toContain("OPENAI_API_KEY");
  });

  test("openai model shows model name", () => {
    const lines = bannerLines({
      model: { kind: "openai", model: "gpt-4.1" },
      tools: { builtins: true },
      runner: { maxToolIters: 8, emitTrace: true },
      tui: { transcriptMaxLines: 10 }
    });
    expect(lines.join("\n")).toContain("openai");
    expect(lines.join("\n")).toContain("gpt-4.1");
  });
});

