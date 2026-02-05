import { describe, expect, test } from "bun:test";
import { OpenAIChatCompletionsModel } from "../model/openai_chat_completions_model";
import { createBuiltinTools } from "../tool/builtins";

describe("OpenAIChatCompletionsModel (BDD)", () => {
  test("Given assistant text output, When generate, Then it returns content", async () => {
    let seenUrl = "";
    let seenBody: any = null;

    const model = new OpenAIChatCompletionsModel({
      apiKey: "test",
      model: "gpt-test",
      baseUrl: "https://example.test",
      fetch: async (url, init) => {
        seenUrl = String(url);
        seenBody = JSON.parse(String(init?.body ?? "{}"));
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: { role: "assistant", content: "hello" }
              }
            ]
          }),
          { status: 200 }
        );
      }
    });

    const tools = createBuiltinTools().map((t) => t.spec);
    const res = await model.generate({ messages: [{ role: "user", content: "hi" }], tools });

    expect(seenUrl).toBe("https://example.test/v1/chat/completions");
    expect(seenBody.model).toBe("gpt-test");
    expect(Array.isArray(seenBody.tools)).toBe(true);
    expect(seenBody.tools[0].type).toBe("function");
    expect(seenBody.tools[0].function.name).toBeTruthy();
    expect(res.content).toBe("hello");
  });

  test("Given tool_calls output, When generate, Then it returns toolCalls", async () => {
    const model = new OpenAIChatCompletionsModel({
      apiKey: "test",
      model: "gpt-test",
      baseUrl: "https://example.test/v1",
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: null,
                  tool_calls: [
                    {
                      id: "call_1",
                      type: "function",
                      function: { name: "clock", arguments: "{}" }
                    }
                  ]
                }
              }
            ]
          }),
          { status: 200 }
        )
    });

    const tools = createBuiltinTools().map((t) => t.spec);
    const res = await model.generate({ messages: [{ role: "user", content: "time" }], tools });

    expect(res.toolCalls?.length).toBe(1);
    expect(res.toolCalls?.[0]).toEqual({ id: "call_1", name: "clock", args: {} });
  });
});

