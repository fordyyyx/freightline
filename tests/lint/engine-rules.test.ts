import { describe, it, expect } from "vitest";
import { ESLint } from "eslint";

const eslint = new ESLint();

async function ruleIdsFor(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((m) => m.ruleId ?? "");
}

describe("engine lint rules", () => {
  it.each([
    ["Date.now()", "no-restricted-properties"],
    ["new Date()", "no-restricted-syntax"],
    ["performance.now()", "no-restricted-globals"],
    ["Math.random()", "no-restricted-properties"],
    ["window", "no-restricted-globals"],
    ["document", "no-restricted-globals"],
    ["localStorage", "no-restricted-globals"],
  ])("rejects %s in src/engine/", async (code, rule) => {
    const ids = await ruleIdsFor(
      `export const x = ${code};\n`,
      "src/engine/x.ts",
    );
    expect(ids).toContain(rule);
  });
  it("allows specified date creation", async () => {
    const ids = await ruleIdsFor(
      "export const x = new Date(Date.UTC(2027, 2, 1))",
      "src/engine/x.ts",
    );
    expect(ids).toEqual([]);
  });
  it.each([
    ["Date.now()", "src/ui/x.ts"],
    ["document.title", "src/ui/x.ts"],
  ])("allows %s in src/ui", async (code, path) => {
    const ids = await ruleIdsFor(`export const x = ${code};\n`, path);
    expect(ids).toEqual([]);
  });
});
