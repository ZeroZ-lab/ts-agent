export type ToolSpec = {
  name: string;
  description: string;
  schema: Record<string, unknown>;
};

export type ToolContext = {
  signal?: AbortSignal;
  now?: () => Date;
};

export type ToolResult = {
  content?: string;
  [k: string]: unknown;
};

export type Tool = {
  spec: ToolSpec;
  run(args: Record<string, unknown>, ctx: ToolContext): Promise<ToolResult>;
};

