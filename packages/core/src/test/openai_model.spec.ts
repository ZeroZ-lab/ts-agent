import { describe, expect, test } from "bun:test";
import { OpenAIResponsesModel } from "../model/openai_responses_model";
import { createBuiltinTools } from "../tool/builtins";

describe("OpenAIResponsesModel (BDD)", () => {
  test("Given assistant text output, When generate, Then it returns content", async () => {
    let seenUrl = "";
    let seenBody: any = null;

    const model = new OpenAIResponsesModel({
      apiKey: "test",
      model: "gpt-test",
      baseUrl: "https://example.test",
      fetch: async (url, init) => {
        seenUrl = String(url);
        seenBody = JSON.parse(String(init?.body ?? "{}"));
        return new Response(
          JSON.stringify({
            output: [
              {
                type: "message",
                role: "assistant",
                content: [{ type: "output_text", text: "hello" }]
              }
            ]
          }),
          { status: 200 }
        );
      }
    });

    const tools = createBuiltinTools().map((t) => t.spec);
    const res = await model.generate({ messages: [{ role: "user", content: "hi" }], tools });

    expect(seenUrl).toBe("https://example.test/v1/responses");
    expect(seenBody.model).toBe("gpt-test");
    expect(Array.isArray(seenBody.tools)).toBe(true);
    expect(seenBody.tools[0].type).toBe("function");
    expect(seenBody.tools[0].strict).toBe(false);
    expect(res.content).toBe("hello");
  });

  test("Given baseUrl ends with /v1, When generate, Then it normalizes URL", async () => {
    let seenUrl = "";

    const model = new OpenAIResponsesModel({
      apiKey: "test",
      model: "gpt-test",
      baseUrl: "https://example.test/v1",
      fetch: async (url) => {
        seenUrl = String(url);
        return new Response(
          JSON.stringify({
            output: [
              {
                type: "message",
                role: "assistant",
                content: [{ type: "output_text", text: "ok" }]
              }
            ]
          }),
          { status: 200 }
        );
      }
    });

    const tools = createBuiltinTools().map((t) => t.spec);
    await model.generate({ messages: [{ role: "user", content: "hi" }], tools });

    expect(seenUrl).toBe("https://example.test/v1/responses");
  });

  test("Given function_call output, When generate, Then it returns toolCalls", async () => {
    const model = new OpenAIResponsesModel({
      apiKey: "test",
      model: "gpt-test",
      baseUrl: "https://example.test",
      fetch: async () =>
        new Response(
          JSON.stringify({
            output: [
              {
                type: "function_call",
                call_id: "call_1",
                name: "clock",
                arguments: "{}"
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
