// TUI state/render 的 BDD 测试

import { describe, expect, test } from "bun:test"; // 导入依赖
import { createInitialState, reducer } from "./state"; // 导入依赖
import { render } from "./render"; // 导入依赖

describe("TUI state/render (BDD)", () => { // 执行语句
  test("Given initial state, When render, Then it includes title and prompt", () => { // 执行语句
    const state = createInitialState({ transcriptMaxLines: 10 }); // 声明常量
    const out = render(state, { columns: 80, rows: 10 }); // 声明常量
    expect(out).toContain("ts-agent"); // 执行语句
    expect(out).toContain("> "); // 执行语句
  }); // 结束代码块

  test("Given append transcript, When render, Then it shows the line", () => { // 执行语句
    let state = createInitialState({ transcriptMaxLines: 10 }); // 声明变量
    state = reducer(state, { type: "append_lines", lines: ["hello"] }); // 执行语句
    const out = render(state, { columns: 80, rows: 10 }); // 声明常量
    expect(out).toContain("hello"); // 执行语句
  }); // 结束代码块

  test("Given input typed, When send (clear), Then input is empty", () => { // 执行语句
    let state = createInitialState({ transcriptMaxLines: 10 }); // 声明变量
    state = reducer(state, { type: "input_append", text: "hi" }); // 执行语句
    expect(state.input).toBe("hi"); // 执行语句
    state = reducer(state, { type: "input_clear" }); // 执行语句
    expect(state.input).toBe(""); // 执行语句
  }); // 结束代码块
}); // 结束代码块

