import type { ChatSession, RunnerEvent } from "@ts-agent/core";
import type { TsAgentConfig } from "@ts-agent/core";
import { StringDecoder } from "node:string_decoder";
import { reducer, type TuiAction, createInitialState, type TuiState } from "./state";
import { render } from "./render";
import { bannerLines } from "./banner";

type Key =
  | { kind: "char"; value: string }
  | { kind: "enter" }
  | { kind: "backspace" }
  | { kind: "ctrl_c" }
  | { kind: "ctrl_l" };

function decodeKeys(text: string): Key[] {
  const keys: Key[] = [];
  let inEscape = false;

  for (const ch of text) {
    if (inEscape) {
      if (/[A-Za-z~]/u.test(ch)) inEscape = false;
      continue;
    }
    if (ch === "\x1b") {
      inEscape = true;
      continue;
    }

    if (ch === "\x03") keys.push({ kind: "ctrl_c" });
    else if (ch === "\x0c") keys.push({ kind: "ctrl_l" });
    else if (ch === "\r" || ch === "\n") keys.push({ kind: "enter" });
    else if (ch === "\x7f") keys.push({ kind: "backspace" });
    else if (ch >= " ") keys.push({ kind: "char", value: ch });
  }

  return keys;
}

export async function runTui(opts: {
  session: ChatSession;
  config: TsAgentConfig;
}): Promise<void> {
  let state: TuiState = createInitialState({ transcriptMaxLines: opts.config.tui.transcriptMaxLines });

  const dispatch = (action: TuiAction) => {
    state = reducer(state, action);
    process.stdout.write(render(state));
  };

  const appendEvent = (event: RunnerEvent) => dispatch({ type: "append_event", event });

  const stdin = process.stdin;
  if (stdin.isTTY) stdin.setRawMode(true);
  stdin.resume();
  const decoder = new StringDecoder("utf8");

  const cleanup = () => {
    try {
      if (stdin.isTTY) stdin.setRawMode(false);
      stdin.pause();
    } catch {
      // ignore
    }
    process.stdout.write("\x1b[2J\x1b[H\x1b[?25h");
  };

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });

  dispatch({ type: "append_lines", lines: bannerLines(opts.config) });

  let running = false;
  const handleSend = async () => {
    const prompt = state.input.trim();
    if (!prompt) return;
    dispatch({ type: "input_clear" });
    dispatch({ type: "set_status", status: "running" });
    running = true;
    try {
      await opts.session.runTurn(prompt, { onEvent: appendEvent });
    } finally {
      running = false;
      dispatch({ type: "set_status", status: "idle" });
    }
  };

  stdin.on("data", async (chunk: Buffer) => {
    const text = decoder.write(chunk);
    for (const key of decodeKeys(text)) {
      if (key.kind === "ctrl_c") {
        cleanup();
        process.exit(0);
      }
      if (key.kind === "ctrl_l") {
        dispatch({ type: "append_lines", lines: ["(cleared)"] });
        continue;
      }
      if (running) continue;
      if (key.kind === "backspace") dispatch({ type: "input_backspace" });
      else if (key.kind === "char") dispatch({ type: "input_append", text: key.value });
      else if (key.kind === "enter") await handleSend();
    }
  });
}
