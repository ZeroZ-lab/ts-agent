import { describe, expect, test } from "bun:test";
import { RuleBasedModel } from "../model/rule_model";
import { createBuiltinTools } from "../tool/builtins";

describe("RuleBasedModel (BDD)", () => {
  test("Given message contains time, When generate, Then it requests clock tool", async () => {
    const model = new RuleBasedModel();
    const tools = createBuiltinTools().map((t) => t.spec);
    const res = await model.generate({ messages: [{ role: "user", content: "现在几点" }], tools });
    expect(res.toolCalls?.[0]?.name).toBe("clock");
  });

  test("Given message contains expression, When generate, Then it requests math tool", async () => {
    const model = new RuleBasedModel();
    const tools = createBuiltinTools().map((t) => t.spec);
    const res = await model.generate({ messages: [{ role: "user", content: "计算 1+2*3" }], tools });
    expect(res.toolCalls?.[0]?.name).toBe("math");
    expect(res.toolCalls?.[0]?.args).toEqual({ expression: "1+2*3" });
  });

  test("Given other message, When generate, Then it replies directly", async () => {
    const model = new RuleBasedModel();
    const tools = createBuiltinTools().map((t) => t.spec);
    const res = await model.generate({ messages: [{ role: "user", content: "你好" }], tools });
    expect(res.content).toContain("你说：");
  });
});

