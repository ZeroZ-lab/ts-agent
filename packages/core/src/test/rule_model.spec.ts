// RuleBasedModel 的 BDD 测试

import { describe, expect, test } from "bun:test"; // 导入依赖
import { RuleBasedModel } from "../model/rule_model"; // 导入依赖
import { createBuiltinTools } from "../tool/builtins"; // 导入依赖

describe("RuleBasedModel (BDD)", () => { // 执行语句
  test("Given message contains time, When generate, Then it requests clock tool", async () => { // 执行语句
    const model = new RuleBasedModel(); // 声明常量
    const tools = createBuiltinTools().map((t) => t.spec); // 声明常量
    const res = await model.generate({ messages: [{ role: "user", content: "现在几点" }], tools }); // 声明常量
    expect(res.toolCalls?.[0]?.name).toBe("clock"); // 执行语句
  }); // 结束代码块

  test("Given message contains expression, When generate, Then it requests math tool", async () => { // 执行语句
    const model = new RuleBasedModel(); // 声明常量
    const tools = createBuiltinTools().map((t) => t.spec); // 声明常量
    const res = await model.generate({ messages: [{ role: "user", content: "计算 1+2*3" }], tools }); // 声明常量
    expect(res.toolCalls?.[0]?.name).toBe("math"); // 执行语句
    expect(res.toolCalls?.[0]?.args).toEqual({ expression: "1+2*3" }); // 执行语句
  }); // 结束代码块

  test("Given other message, When generate, Then it replies directly", async () => { // 执行语句
    const model = new RuleBasedModel(); // 声明常量
    const tools = createBuiltinTools().map((t) => t.spec); // 声明常量
    const res = await model.generate({ messages: [{ role: "user", content: "你好" }], tools }); // 声明常量
    expect(res.content).toContain("你说："); // 执行语句
  }); // 结束代码块
}); // 结束代码块

