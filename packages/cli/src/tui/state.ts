import type { RunnerEvent } from "@ts-agent/core";

export type TuiStatus = "idle" | "running";

export type TuiState = {
  title: string;
  status: TuiStatus;
  input: string;
  transcript: string[];
  transcriptMaxLines: number;
};

export type TuiAction =
  | { type: "input_append"; text: string }
  | { type: "input_backspace" }
  | { type: "input_clear" }
  | { type: "set_status"; status: TuiStatus }
  | { type: "append_lines"; lines: string[] }
  | { type: "append_event"; event: RunnerEvent };

export function createInitialState(opts: { transcriptMaxLines: number }): TuiState {
  return {
    title: "ts-agent",
    status: "idle",
    input: "",
    transcript: [],
    transcriptMaxLines: opts.transcriptMaxLines
  };
}

function formatEventLine(e: RunnerEvent): string[] {
  if (e.type === "turn_started") return [`> user: ${e.userMessage}`];
  if (e.type === "tool_started") return [`* tool_started: ${e.toolCall.name}`];
  if (e.type === "tool_completed")
    return [`* tool_completed: ${e.toolName} ${JSON.stringify(e.result)}`];
  if (e.type === "tool_failed") return [`* tool_failed: ${e.toolName} ${e.error.message}`];
  if (e.type === "turn_completed") return [`< assistant: ${e.assistantMessage}`];
  if (e.type === "turn_failed") return [`! turn_failed: ${e.error.message}`];
  if (e.type === "model_started") return [`* model_started`];
  if (e.type === "model_completed") return [`* model_completed`];
  return [`* ${e.type}`];
}

export function reducer(state: TuiState, action: TuiAction): TuiState {
  if (action.type === "input_append") return { ...state, input: state.input + action.text };
  if (action.type === "input_backspace") return { ...state, input: state.input.slice(0, -1) };
  if (action.type === "input_clear") return { ...state, input: "" };
  if (action.type === "set_status") return { ...state, status: action.status };
  if (action.type === "append_lines") {
    const transcript = [...state.transcript, ...action.lines];
    const clipped =
      transcript.length > state.transcriptMaxLines
        ? transcript.slice(transcript.length - state.transcriptMaxLines)
        : transcript;
    return { ...state, transcript: clipped };
  }
  if (action.type === "append_event") {
    return reducer(state, { type: "append_lines", lines: formatEventLine(action.event) });
  }
  return state;
}

