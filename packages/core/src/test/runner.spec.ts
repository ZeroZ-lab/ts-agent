import { describe, expect, test } from "bun:test";
import { createChatSession } from "../chat/chat_session";
import { ScriptedModel } from "../model/scripted_model";
import { createBuiltinTools } from "../tool/builtins";

describe("ChatSession.runTurn (BDD)", () => {
  test("Given ScriptedModel requests clock, When runTurn, Then tool result is appended and turn completes", async () => {
    const tools = createBuiltinTools();
    const model = new ScriptedModel([
      { toolCalls: [{ id: "t1", name: "clock", args: {} }] },
      { content: "ok" }
    ]);
    const session = createChatSession({
      model,
      tools,
      toolContext: { now: () => new Date("2026-02-05T00:00:00.000Z") }
    });

    const result = await session.runTurn("现在几点");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const eventTypes = result.events.map((e) => e.type);
    expect(eventTypes).toEqual([
      "turn_started",
      "model_started",
      "model_completed",
      "tool_started",
      "tool_completed",
      "model_started",
      "model_completed",
      "turn_completed"
    ]);

    const toolMsg = result.messages.find((m) => m.role === "tool");
    expect(toolMsg).toBeTruthy();
    expect((toolMsg as any).toolName).toBe("clock");
    expect((toolMsg as any).content).toContain("2026-02-05T00:00:00.000Z");
  });

  test("Given tool throws, When runTurn, Then tool_failed and turn_failed appear", async () => {
    const tools = [
      {
        spec: { name: "boom", description: "throws", schema: { type: "object", properties: {} } },
        async run() {
          throw new Error("boom");
        }
      }
    ];
    const model = new ScriptedModel([{ toolCalls: [{ id: "t1", name: "boom", args: {} }] }]);
    const session = createChatSession({ model, tools });

    const result = await session.runTurn("x");
    expect(result.ok).toBe(false);

    const eventTypes = result.events.map((e) => e.type);
    expect(eventTypes).toContain("tool_failed");
    expect(eventTypes[eventTypes.length - 1]).toBe("turn_failed");
  });

  test("Given infinite tool loop, When runTurn, Then maxToolIters prevents it", async () => {
    const tools = createBuiltinTools();
    const model = new ScriptedModel([
      () => ({ toolCalls: [{ id: crypto.randomUUID(), name: "clock", args: {} }] })
    ]);
    const session = createChatSession({
      model,
      tools,
      runner: { maxToolIters: 2, emitTrace: true }
    });

    const result = await session.runTurn("现在几点");
    expect(result.ok).toBe(false);
    expect(result.events.map((e) => e.type)).toContain("turn_failed");
  });
});

