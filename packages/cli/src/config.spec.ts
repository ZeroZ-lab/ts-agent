import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "./config";

describe("loadConfig (BDD)", () => {
  test("Given config missing, When loadConfig, Then defaults are returned", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ts-agent-"));
    const cfg = await loadConfig({ cwd: dir });
    expect(cfg.model.kind).toBe("rule");
    expect(cfg.tools.builtins).toBe(true);
  });
});

