export type TestContext = Record<string, unknown>;

export async function given<T extends TestContext>(
  _name: string,
  fn: (ctx: Partial<T>) => T | Promise<T>
): Promise<T> {
  return await fn({});
}

export async function when<T extends TestContext>(
  _name: string,
  fn: (ctx: T) => T | Promise<T>,
  ctx: T
): Promise<T> {
  return await fn(ctx);
}

export async function then<T extends TestContext>(
  _name: string,
  fn: (ctx: T) => void | Promise<void>,
  ctx: T
): Promise<T> {
  await fn(ctx);
  return ctx;
}

