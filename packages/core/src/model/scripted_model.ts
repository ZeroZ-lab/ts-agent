// ScriptedModel：按脚本回放的模型实现

import type { Model, ModelRequest, ModelResponse } from "./types"; // 导入类型依赖

export class ScriptedModel implements Model { // 导出类定义
  #queue: Array<ModelResponse | ((req: ModelRequest) => ModelResponse | Promise<ModelResponse>)>; // 执行语句

  constructor( // 定义构造函数
    script: Array<ModelResponse | ((req: ModelRequest) => ModelResponse | Promise<ModelResponse>)> // 执行语句
  ) { // 执行语句
    this.#queue = [...script]; // 执行语句
  } // 结束代码块

  async generate(req: ModelRequest): Promise<ModelResponse> { // 执行语句
    const next = this.#queue.shift(); // 声明常量
    if (!next) { // 条件判断
      throw new Error("ScriptedModel: script exhausted"); // 抛出错误
    } // 结束代码块
    if (typeof next === "function") { // 条件判断
      return await next(req); // 返回结果
    } // 结束代码块
    return next; // 返回结果
  } // 结束代码块
} // 结束代码块

