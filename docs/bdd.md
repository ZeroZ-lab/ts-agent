# BDD（行为驱动）规范

本项目使用 Bun 原生 `bun:test`，并用轻量 DSL 固化 Given/When/Then 结构。

## 约定

- 测试文件：`*.spec.ts`
- 测试描述：用 Given / When / Then 分段描述行为
- 测试只断言“可观察行为”：事件顺序、messages 内容、渲染结果等

## DSL

在 `packages/core/src/test/bdd.ts` 提供：

- `given(name, fn)`
- `when(name, fn)`
- `then(name, fn)`

它们共享同一个 `ctx`，避免在测试里散落全局变量。

