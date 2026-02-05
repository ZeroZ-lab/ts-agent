// 配置加载的 BDD 测试

import { describe, expect, test } from "bun:test"; // 导入依赖
import { mkdtempSync } from "node:fs"; // 导入依赖
import { tmpdir } from "node:os"; // 导入依赖
import { join } from "node:path"; // 导入依赖
import { loadConfig } from "./config"; // 导入依赖

describe("loadConfig (BDD)", () => { // 执行语句
  test("Given config missing, When loadConfig, Then defaults are returned", async () => { // 执行语句
    const dir = mkdtempSync(join(tmpdir(), "ts-agent-")); // 声明常量
    const cfg = await loadConfig({ cwd: dir }); // 声明常量
    expect(cfg.model.kind).toBe("rule"); // 执行语句
    expect(cfg.tools.builtins).toBe(true); // 执行语句
  }); // 结束代码块
}); // 结束代码块

