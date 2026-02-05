// 轻量 Given/When/Then BDD DSL

export type TestContext = Record<string, unknown>; // 导出类型定义

export async function given<T extends TestContext>( // 执行语句
  _name: string, // 执行语句
  fn: (ctx: Partial<T>) => T | Promise<T> // 执行语句
): Promise<T> { // 执行语句
  return await fn({}); // 返回结果
} // 结束代码块

export async function when<T extends TestContext>( // 执行语句
  _name: string, // 执行语句
  fn: (ctx: T) => T | Promise<T>, // 执行语句
  ctx: T // 执行语句
): Promise<T> { // 执行语句
  return await fn(ctx); // 返回结果
} // 结束代码块

export async function then<T extends TestContext>( // 执行语句
  _name: string, // 执行语句
  fn: (ctx: T) => void | Promise<void>, // 执行语句
  ctx: T // 执行语句
): Promise<T> { // 执行语句
  await fn(ctx); // 等待异步结果
  return ctx; // 返回结果
} // 结束代码块

