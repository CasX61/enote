import { describe, it, expect } from "vitest";
import { wordCount, snippet } from "./text";

describe("wordCount", () => {
  it("zählt leeren/whitespace-Text als 0", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   \n  ")).toBe(0);
  });

  it("ignoriert mehrfache Leerzeichen und Umbrüche", () => {
    expect(wordCount("ein  zwei\n\ndrei   vier")).toBe(4);
  });

  it("zählt ein einzelnes Wort", () => {
    expect(wordCount("  hallo ")).toBe(1);
  });
});

describe("snippet", () => {
  it("kürzt langen Text mit Ellipse", () => {
    const out = snippet("a".repeat(200), 10);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(11);
  });

  it("lässt kurzen Text unverändert und kollabiert Whitespace", () => {
    expect(snippet("kurz   text")).toBe("kurz text");
  });
});
