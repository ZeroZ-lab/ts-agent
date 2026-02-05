// OpenAI BaseURL/API Path 规范化与拼接

function unquote(text: string): string { // 定义函数
  const t = text.trim(); // 声明常量
  const quoted = // 声明常量
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) || (t.startsWith("'") && t.endsWith("'") && t.length >= 2); // 执行语句
  return quoted ? t.slice(1, -1).trim() : t; // 返回结果
} // 结束代码块

export function normalizeBaseUrl(baseUrl: string): string { // 导出函数定义
  const raw = unquote(baseUrl); // 声明常量
  if (!raw) throw new Error("OpenAI: baseUrl is empty"); // 条件判断

  let u: URL; // 声明变量
  try { // 开始异常捕获
    u = new URL(raw); // 执行语句
  } catch { // 执行语句
    throw new Error(`OpenAI: invalid baseUrl: ${raw}`); // 抛出错误
  } // 结束代码块

  if (u.protocol !== "http:" && u.protocol !== "https:") { // 条件判断
    throw new Error(`OpenAI: invalid baseUrl protocol: ${u.protocol}`); // 抛出错误
  } // 结束代码块

  // drop query/hash if present; keep pathname
  u.search = ""; // 执行语句
  u.hash = ""; // 执行语句

  return u.toString().replace(/\/+$/u, ""); // 返回结果
} // 结束代码块

export function normalizeApiPath(apiPath?: string): string { // 导出函数定义
  const raw = unquote(apiPath ?? "/v1"); // 声明常量
  const trimmed = raw.trim(); // 声明常量
  if (!trimmed) return ""; // 条件判断
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`; // 声明常量
  return withSlash.replace(/\/+$/u, ""); // 返回结果
} // 结束代码块

export function mergeBaseUrlAndApiPath(baseUrl: string, apiPath: string): { baseUrl: string; apiPath: string } { // 导出函数定义
  const b = normalizeBaseUrl(baseUrl); // 声明常量
  const p = normalizeApiPath(apiPath); // 声明常量
  if (!p) return { baseUrl: b, apiPath: "" }; // 条件判断

  // If the user already included the apiPath in baseUrl, avoid duplicating it.
  if (b.endsWith(p)) { // 条件判断
    const stripped = b.slice(0, b.length - p.length).replace(/\/+$/u, ""); // 声明常量
    return { baseUrl: stripped || b, apiPath: p }; // 返回结果
  } // 结束代码块
  return { baseUrl: b, apiPath: p }; // 返回结果
} // 结束代码块

export function joinUrl(baseUrl: string, path: string): string { // 导出函数定义
  const b = baseUrl.replace(/\/+$/u, ""); // 声明常量
  const p = path.startsWith("/") ? path : `/${path}`; // 声明常量
  return `${b}${p}`; // 返回结果
} // 结束代码块

