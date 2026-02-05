import type { Tool } from "./types";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  throw new Error(`Invalid number: ${String(value)}`);
}

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: "+" | "-" | "*" | "/" }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(expr: string): Token[] {
  const s = expr.replace(/\s+/g, "");
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/[0-9.]/u.test(ch)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/u.test(s[j]!)) j++;
      const raw = s.slice(i, j);
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`Invalid number literal: ${raw}`);
      tokens.push({ type: "num", value: n });
      i = j;
      continue;
    }
    throw new Error(`Unexpected char: ${ch}`);
  }
  return tokens;
}

function precedence(op: "+" | "-" | "*" | "/"): number {
  return op === "*" || op === "/" ? 2 : 1;
}

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  for (const t of tokens) {
    if (t.type === "num") output.push(t);
    else if (t.type === "op") {
      while (stack.length > 0) {
        const top = stack[stack.length - 1]!;
        if (top.type === "op" && precedence(top.value) >= precedence(t.value)) {
          output.push(stack.pop()!);
          continue;
        }
        break;
      }
      stack.push(t);
    } else if (t.type === "lparen") stack.push(t);
    else if (t.type === "rparen") {
      while (stack.length > 0 && stack[stack.length - 1]!.type !== "lparen") {
        output.push(stack.pop()!);
      }
      const lp = stack.pop();
      if (!lp || lp.type !== "lparen") throw new Error("Mismatched parentheses");
    }
  }
  while (stack.length > 0) {
    const t = stack.pop()!;
    if (t.type === "lparen" || t.type === "rparen") throw new Error("Mismatched parentheses");
    output.push(t);
  }
  return output;
}

function evalRpn(rpn: Token[]): number {
  const st: number[] = [];
  for (const t of rpn) {
    if (t.type === "num") st.push(t.value);
    else if (t.type === "op") {
      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) throw new Error("Invalid expression");
      if (t.value === "+") st.push(a + b);
      else if (t.value === "-") st.push(a - b);
      else if (t.value === "*") st.push(a * b);
      else st.push(a / b);
    }
  }
  if (st.length !== 1) throw new Error("Invalid expression");
  return st[0]!;
}

function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  return evalRpn(rpn);
}

export function createBuiltinTools(): Tool[] {
  const echo: Tool = {
    spec: {
      name: "echo",
      description: "返回输入文本",
      schema: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"]
      }
    },
    async run(args) {
      return { text: String(args.text ?? "") };
    }
  };

  const math: Tool = {
    spec: {
      name: "math",
      description: "计算简单算术表达式",
      schema: {
        type: "object",
        properties: { expression: { type: "string" } },
        required: ["expression"]
      }
    },
    async run(args) {
      const expression = String(args.expression ?? "");
      const value = evaluateExpression(expression);
      return { expression, value };
    }
  };

  const clock: Tool = {
    spec: {
      name: "clock",
      description: "返回当前时间",
      schema: { type: "object", properties: {} }
    },
    async run(_args, ctx) {
      const now = ctx.now ? ctx.now() : new Date();
      return { now: now.toISOString() };
    }
  };

  return [echo, math, clock];
}

