// OpenAIResponsesModel 的 BDD 测试

import { describe, expect, test } from "bun:test"; // 导入依赖
import { OpenAIResponsesModel } from "../model/openai_responses_model"; // 导入依赖
import { createBuiltinTools } from "../tool/builtins"; // 导入依赖

describe("OpenAIResponsesModel (BDD)", () => { // 执行语句
  test("Given assistant text output, When generate, Then it returns content", async () => { // 执行语句
    let seenUrl = ""; // 声明变量
    let seenBody: any = null; // 声明变量

    const model = new OpenAIResponsesModel({ // 声明常量
      apiKey: "test", // 执行语句
      model: "gpt-test", // 执行语句
      baseUrl: "https://example.test", // 执行语句
      fetch: async (url, init) => { // 执行语句
        seenUrl = String(url); // 执行语句
        seenBody = JSON.parse(String(init?.body ?? "{}")); // 执行语句
        return new Response( // 返回结果
          JSON.stringify({ // 执行语句
            output: [ // 执行语句
              { // 执行语句
                type: "message", // 执行语句
                role: "assistant", // 执行语句
                content: [{ type: "output_text", text: "hello" }] // 执行语句
              } // 结束代码块
            ] // 结束代码块
          }), // 执行语句
          { status: 200 } // 执行语句
        ); // 结束代码块
      } // 结束代码块
    }); // 结束代码块

    const tools = createBuiltinTools().map((t) => t.spec); // 声明常量
    const res = await model.generate({ messages: [{ role: "user", content: "hi" }], tools }); // 声明常量

    expect(seenUrl).toBe("https://example.test/v1/responses"); // 执行语句
    expect(seenBody.model).toBe("gpt-test"); // 执行语句
    expect(Array.isArray(seenBody.tools)).toBe(true); // 执行语句
    expect(seenBody.tools[0].type).toBe("function"); // 执行语句
    expect(seenBody.tools[0].strict).toBe(false); // 执行语句
    expect(res.content).toBe("hello"); // 执行语句
  }); // 结束代码块

  test("Given baseUrl ends with /v1, When generate, Then it normalizes URL", async () => { // 执行语句
    let seenUrl = ""; // 声明变量

    const model = new OpenAIResponsesModel({ // 声明常量
      apiKey: "test", // 执行语句
      model: "gpt-test", // 执行语句
      baseUrl: "https://example.test/v1", // 执行语句
      fetch: async (url) => { // 执行语句
        seenUrl = String(url); // 执行语句
        return new Response( // 返回结果
          JSON.stringify({ // 执行语句
            output: [ // 执行语句
              { // 执行语句
                type: "message", // 执行语句
                role: "assistant", // 执行语句
                content: [{ type: "output_text", text: "ok" }] // 执行语句
              } // 结束代码块
            ] // 结束代码块
          }), // 执行语句
          { status: 200 } // 执行语句
        ); // 结束代码块
      } // 结束代码块
    }); // 结束代码块

    const tools = createBuiltinTools().map((t) => t.spec); // 声明常量
    await model.generate({ messages: [{ role: "user", content: "hi" }], tools }); // 等待异步结果

    expect(seenUrl).toBe("https://example.test/v1/responses"); // 执行语句
  }); // 结束代码块

  test("Given function_call output, When generate, Then it returns toolCalls", async () => { // 执行语句
    const model = new OpenAIResponsesModel({ // 声明常量
      apiKey: "test", // 执行语句
      model: "gpt-test", // 执行语句
      baseUrl: "https://example.test", // 执行语句
      fetch: async () => // 执行语句
        new Response( // 执行语句
          JSON.stringify({ // 执行语句
            output: [ // 执行语句
              { // 执行语句
                type: "function_call", // 执行语句
                call_id: "call_1", // 执行语句
                name: "clock", // 执行语句
                arguments: "{}" // 执行语句
              } // 结束代码块
            ] // 结束代码块
          }), // 执行语句
          { status: 200 } // 执行语句
        ) // 结束代码块
    }); // 结束代码块

    const tools = createBuiltinTools().map((t) => t.spec); // 声明常量
    const res = await model.generate({ messages: [{ role: "user", content: "time" }], tools }); // 声明常量

    expect(res.toolCalls?.length).toBe(1); // 执行语句
    expect(res.toolCalls?.[0]).toEqual({ id: "call_1", name: "clock", args: {} }); // 执行语句
  }); // 结束代码块
}); // 结束代码块
