// 内置工具实现（echo/math/clock 等）

import type { Tool } from "./types"; // 导入类型依赖

function toNumber(value: unknown): number { // 定义函数
  if (typeof value === "number") return value; // 条件判断
  if (typeof value === "string" && value.trim().length > 0) { // 条件判断
    const n = Number(value); // 声明常量
    if (Number.isFinite(n)) return n; // 条件判断
  } // 结束代码块
  throw new Error(`Invalid number: ${String(value)}`); // 抛出错误
} // 结束代码块

type Token = // 定义类型
  | { type: "num"; value: number } // 执行语句
  | { type: "op"; value: "+" | "-" | "*" | "/" } // 执行语句
  | { type: "lparen" } // 执行语句
  | { type: "rparen" }; // 执行语句

function tokenize(expr: string): Token[] { // 定义函数
  const s = expr.replace(/\s+/g, ""); // 声明常量
  const tokens: Token[] = []; // 声明常量
  let i = 0; // 声明变量
  while (i < s.length) { // 循环条件
    const ch = s[i]!; // 声明常量
    if (ch === "(") { // 条件判断
      tokens.push({ type: "lparen" }); // 执行语句
      i++; // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
    if (ch === ")") { // 条件判断
      tokens.push({ type: "rparen" }); // 执行语句
      i++; // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") { // 条件判断
      tokens.push({ type: "op", value: ch }); // 执行语句
      i++; // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
    if (/[0-9.]/u.test(ch)) { // 条件判断
      let j = i + 1; // 声明变量
      while (j < s.length && /[0-9.]/u.test(s[j]!)) j++; // 循环条件
      const raw = s.slice(i, j); // 声明常量
      const n = Number(raw); // 声明常量
      if (!Number.isFinite(n)) throw new Error(`Invalid number literal: ${raw}`); // 条件判断
      tokens.push({ type: "num", value: n }); // 执行语句
      i = j; // 执行语句
      continue; // 继续下一轮
    } // 结束代码块
    throw new Error(`Unexpected char: ${ch}`); // 抛出错误
  } // 结束代码块
  return tokens; // 返回结果
} // 结束代码块

function precedence(op: "+" | "-" | "*" | "/"): number { // 定义函数
  return op === "*" || op === "/" ? 2 : 1; // 返回结果
} // 结束代码块

function toRpn(tokens: Token[]): Token[] { // 定义函数
  const output: Token[] = []; // 声明常量
  const stack: Token[] = []; // 声明常量
  for (const t of tokens) { // 循环遍历
    if (t.type === "num") output.push(t); // 条件判断
    else if (t.type === "op") { // 否则条件判断
      while (stack.length > 0) { // 循环条件
        const top = stack[stack.length - 1]!; // 声明常量
        if (top.type === "op" && precedence(top.value) >= precedence(t.value)) { // 条件判断
          output.push(stack.pop()!); // 执行语句
          continue; // 继续下一轮
        } // 结束代码块
        break; // 跳出当前块
      } // 结束代码块
      stack.push(t); // 执行语句
    } else if (t.type === "lparen") stack.push(t); // 执行语句
    else if (t.type === "rparen") { // 否则条件判断
      while (stack.length > 0 && stack[stack.length - 1]!.type !== "lparen") { // 循环条件
        output.push(stack.pop()!); // 执行语句
      } // 结束代码块
      const lp = stack.pop(); // 声明常量
      if (!lp || lp.type !== "lparen") throw new Error("Mismatched parentheses"); // 条件判断
    } // 结束代码块
  } // 结束代码块
  while (stack.length > 0) { // 循环条件
    const t = stack.pop()!; // 声明常量
    if (t.type === "lparen" || t.type === "rparen") throw new Error("Mismatched parentheses"); // 条件判断
    output.push(t); // 执行语句
  } // 结束代码块
  return output; // 返回结果
} // 结束代码块

function evalRpn(rpn: Token[]): number { // 定义函数
  const st: number[] = []; // 声明常量
  for (const t of rpn) { // 循环遍历
    if (t.type === "num") st.push(t.value); // 条件判断
    else if (t.type === "op") { // 否则条件判断
      const b = st.pop(); // 声明常量
      const a = st.pop(); // 声明常量
      if (a === undefined || b === undefined) throw new Error("Invalid expression"); // 条件判断
      if (t.value === "+") st.push(a + b); // 条件判断
      else if (t.value === "-") st.push(a - b); // 否则条件判断
      else if (t.value === "*") st.push(a * b); // 否则条件判断
      else st.push(a / b); // 执行语句
    } // 结束代码块
  } // 结束代码块
  if (st.length !== 1) throw new Error("Invalid expression"); // 条件判断
  return st[0]!; // 返回结果
} // 结束代码块

function evaluateExpression(expression: string): number { // 定义函数
  const tokens = tokenize(expression); // 声明常量
  const rpn = toRpn(tokens); // 声明常量
  return evalRpn(rpn); // 返回结果
} // 结束代码块

export function createBuiltinTools(): Tool[] { // 导出函数定义
  const echo: Tool = { // 声明常量
    spec: { // 执行语句
      name: "echo", // 执行语句
      description: "返回输入文本", // 执行语句
      schema: { // 执行语句
        type: "object", // 执行语句
        properties: { text: { type: "string" } }, // 执行语句
        required: ["text"] // 执行语句
      } // 结束代码块
    }, // 执行语句
    async run(args) { // 执行语句
      return { text: String(args.text ?? "") }; // 返回结果
    } // 结束代码块
  }; // 结束代码块

  const math: Tool = { // 声明常量
    spec: { // 执行语句
      name: "math", // 执行语句
      description: "计算简单算术表达式", // 执行语句
      schema: { // 执行语句
        type: "object", // 执行语句
        properties: { expression: { type: "string" } }, // 执行语句
        required: ["expression"] // 执行语句
      } // 结束代码块
    }, // 执行语句
    async run(args) { // 执行语句
      const expression = String(args.expression ?? ""); // 声明常量
      const value = evaluateExpression(expression); // 声明常量
      return { expression, value }; // 返回结果
    } // 结束代码块
  }; // 结束代码块

  const clock: Tool = { // 声明常量
    spec: { // 执行语句
      name: "clock", // 执行语句
      description: "返回当前时间", // 执行语句
      schema: { type: "object", properties: {} } // 执行语句
    }, // 执行语句
    async run(_args, ctx) { // 执行语句
      const now = ctx.now ? ctx.now() : new Date(); // 声明常量
      return { now: now.toISOString() }; // 返回结果
    } // 结束代码块
  }; // 结束代码块

  return [echo, math, clock]; // 返回结果
} // 结束代码块

