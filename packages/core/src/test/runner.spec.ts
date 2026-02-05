// ChatSession.runTurn 的 BDD 测试

import { describe, expect, test } from "bun:test"; // 导入依赖
import { createChatSession } from "../chat/chat_session"; // 导入依赖
import { ScriptedModel } from "../model/scripted_model"; // 导入依赖
import { createBuiltinTools } from "../tool/builtins"; // 导入依赖

describe("ChatSession.runTurn (BDD)", () => { // 执行语句
  test("Given ScriptedModel requests clock, When runTurn, Then tool result is appended and turn completes", async () => { // 执行语句
    const tools = createBuiltinTools(); // 声明常量
    const model = new ScriptedModel([ // 声明常量
      { toolCalls: [{ id: "t1", name: "clock", args: {} }] }, // 执行语句
      { content: "ok" } // 执行语句
    ]); // 结束代码块
    const session = createChatSession({ // 声明常量
      model, // 执行语句
      tools, // 执行语句
      toolContext: { now: () => new Date("2026-02-05T00:00:00.000Z") } // 执行语句
    }); // 结束代码块

    const result = await session.runTurn("现在几点"); // 声明常量
    expect(result.ok).toBe(true); // 执行语句
    if (!result.ok) return; // 条件判断

    const eventTypes = result.events.map((e) => e.type); // 声明常量
    expect(eventTypes).toEqual([ // 执行语句
      "turn_started", // 执行语句
      "model_started", // 执行语句
      "model_completed", // 执行语句
      "tool_started", // 执行语句
      "tool_completed", // 执行语句
      "model_started", // 执行语句
      "model_completed", // 执行语句
      "turn_completed" // 执行语句
    ]); // 结束代码块

    const toolMsg = result.messages.find((m) => m.role === "tool"); // 声明常量
    expect(toolMsg).toBeTruthy(); // 执行语句
    expect((toolMsg as any).toolName).toBe("clock"); // 执行语句
    expect((toolMsg as any).content).toContain("2026-02-05T00:00:00.000Z"); // 执行语句
  }); // 结束代码块

  test("Given tool throws, When runTurn, Then tool_failed and turn_failed appear", async () => { // 执行语句
    const tools = [ // 声明常量
      { // 执行语句
        spec: { name: "boom", description: "throws", schema: { type: "object", properties: {} } }, // 执行语句
        async run() { // 执行语句
          throw new Error("boom"); // 抛出错误
        } // 结束代码块
      } // 结束代码块
    ]; // 结束代码块
    const model = new ScriptedModel([{ toolCalls: [{ id: "t1", name: "boom", args: {} }] }]); // 声明常量
    const session = createChatSession({ model, tools }); // 声明常量

    const result = await session.runTurn("x"); // 声明常量
    expect(result.ok).toBe(false); // 执行语句

    const eventTypes = result.events.map((e) => e.type); // 声明常量
    expect(eventTypes).toContain("tool_failed"); // 执行语句
    expect(eventTypes[eventTypes.length - 1]).toBe("turn_failed"); // 执行语句
  }); // 结束代码块

  test("Given infinite tool loop, When runTurn, Then maxToolIters prevents it", async () => { // 执行语句
    const tools = createBuiltinTools(); // 声明常量
    const model = new ScriptedModel([ // 声明常量
      () => ({ toolCalls: [{ id: crypto.randomUUID(), name: "clock", args: {} }] }) // 执行语句
    ]); // 结束代码块
    const session = createChatSession({ // 声明常量
      model, // 执行语句
      tools, // 执行语句
      runner: { maxToolIters: 2, emitTrace: true } // 执行语句
    }); // 结束代码块

    const result = await session.runTurn("现在几点"); // 声明常量
    expect(result.ok).toBe(false); // 执行语句
    expect(result.events.map((e) => e.type)).toContain("turn_failed"); // 执行语句
  }); // 结束代码块
}); // 结束代码块

