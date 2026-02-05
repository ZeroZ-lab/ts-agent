// TUI banner 文案测试

import { describe, expect, test } from "bun:test"; // 导入依赖
import { bannerLines } from "./banner"; // 导入依赖

describe("TUI banner", () => { // 执行语句
  test("rule model shows OpenAI hint", () => { // 执行语句
    const lines = bannerLines({ // 声明常量
      model: { kind: "rule" }, // 执行语句
      tools: { builtins: true }, // 执行语句
      runner: { maxToolIters: 8, emitTrace: true }, // 执行语句
      tui: { transcriptMaxLines: 10 } // 执行语句
    }); // 结束代码块
    expect(lines.join("\n")).toContain("当前模型：rule"); // 执行语句
    expect(lines.join("\n")).toContain("OPENAI_API_KEY"); // 执行语句
  }); // 结束代码块

  test("openai model shows model name", () => { // 执行语句
    const lines = bannerLines({ // 声明常量
      model: { kind: "openai", model: "gpt-4.1" }, // 执行语句
      tools: { builtins: true }, // 执行语句
      runner: { maxToolIters: 8, emitTrace: true }, // 执行语句
      tui: { transcriptMaxLines: 10 } // 执行语句
    }); // 结束代码块
    expect(lines.join("\n")).toContain("openai"); // 执行语句
    expect(lines.join("\n")).toContain("gpt-4.1"); // 执行语句
  }); // 结束代码块
}); // 结束代码块

