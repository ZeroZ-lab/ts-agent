import type { TuiState } from "./state";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function render(state: TuiState, dims?: { columns: number; rows: number }): string {
  const columns = dims?.columns ?? process.stdout.columns ?? 80;
  const rows = dims?.rows ?? process.stdout.rows ?? 24;
  const header = `${state.title} [${state.status}]`;
  const prompt = `> ${state.input}`;

  const usableRows = clamp(rows - 3, 1, rows);
  const transcriptLines = state.transcript.slice(-usableRows);

  const pad = (s: string) => (s.length > columns ? s.slice(0, Math.max(0, columns - 1)) : s);
  const body = transcriptLines.map(pad).join("\n");

  return [
    "\x1b[?25l", // hide cursor
    "\x1b[2J\x1b[H", // clear + home
    pad(header),
    "",
    body,
    "",
    pad(prompt),
    "\x1b[?25h" // show cursor
  ].join("\n");
}

