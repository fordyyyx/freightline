import { describe, it, expect } from "vitest";
import { companyNameProblem } from "../../src/engine/company.ts";

describe("companyNameProblem", () => {
  it("returns null for a valid name", () => {
    expect(companyNameProblem("PlymFreight")).toBe(null);
  });

  it("returns empty for an empty name", () => {
    expect(companyNameProblem(" ")).toEqual("empty");
    expect(companyNameProblem("")).toEqual("empty");
  });

  it("returns too long for a name that is too long", () => {
    expect(companyNameProblem("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toEqual(
      "tooLong",
    );
  });

  it("returns null for a name exactly on the upper length limit", () => {
    expect(companyNameProblem("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(null);
  });

  it("returns null for an untrimmed valid name", () => {
    expect(companyNameProblem("  Acme Haulage  ")).toBe(null);
  });
});
