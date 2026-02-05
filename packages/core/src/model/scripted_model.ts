import type { Model, ModelRequest, ModelResponse } from "./types";

export class ScriptedModel implements Model {
  #queue: Array<ModelResponse | ((req: ModelRequest) => ModelResponse | Promise<ModelResponse>)>;

  constructor(
    script: Array<ModelResponse | ((req: ModelRequest) => ModelResponse | Promise<ModelResponse>)>
  ) {
    this.#queue = [...script];
  }

  async generate(req: ModelRequest): Promise<ModelResponse> {
    const next = this.#queue.shift();
    if (!next) {
      throw new Error("ScriptedModel: script exhausted");
    }
    if (typeof next === "function") {
      return await next(req);
    }
    return next;
  }
}

