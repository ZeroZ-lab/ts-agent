import { describe, expect, test } from "bun:test";
import { createInitialState, reducer } from "./state";
import { render } from "./render";

describe("TUI state/render (BDD)", () => {
  test("Given initial state, When render, Then it includes title and prompt", () => {
    const state = createInitialState({ transcriptMaxLines: 10 });
    const out = render(state, { columns: 80, rows: 10 });
    expect(out).toContain("ts-agent");
    expect(out).toContain("> ");
  });

  test("Given append transcript, When render, Then it shows the line", () => {
    let state = createInitialState({ transcriptMaxLines: 10 });
    state = reducer(state, { type: "append_lines", lines: ["hello"] });
    const out = render(state, { columns: 80, rows: 10 });
    expect(out).toContain("hello");
  });

  test("Given input typed, When send (clear), Then input is empty", () => {
    let state = createInitialState({ transcriptMaxLines: 10 });
    state = reducer(state, { type: "input_append", text: "hi" });
    expect(state.input).toBe("hi");
    state = reducer(state, { type: "input_clear" });
    expect(state.input).toBe("");
  });
});

