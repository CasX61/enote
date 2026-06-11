import { describe, it, expect } from "vitest";
import { rowToNote } from "./db";

describe("rowToNote", () => {
  const base = {
    id: 1,
    title: "Titel",
    content: "Inhalt",
    color: "#378ADD",
    created_at: "2026-06-11 10:00:00",
    updated_at: "2026-06-11 10:05:00",
  };

  it("castet is_template 1 → true", () => {
    expect(rowToNote({ ...base, is_template: 1 }).is_template).toBe(true);
  });

  it("castet is_template 0 → false", () => {
    expect(rowToNote({ ...base, is_template: 0 }).is_template).toBe(false);
  });

  it("übernimmt die übrigen Felder unverändert", () => {
    const note = rowToNote({ ...base, is_template: 0 });
    expect(note).toMatchObject({
      id: 1,
      title: "Titel",
      content: "Inhalt",
      color: "#378ADD",
    });
  });
});
