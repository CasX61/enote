import { describe, it, expect } from "vitest";
import {
  insertTodoItem,
  applyTodoEnter,
  toggleTodoAt,
  UNCHECKED,
} from "./todo";

describe("insertTodoItem", () => {
  it("fügt am Zeilenanfang ohne führenden Umbruch ein", () => {
    const r = insertTodoItem("", 0);
    expect(r.value).toBe(UNCHECKED);
    expect(r.caret).toBe(UNCHECKED.length);
  });

  it("setzt einen Umbruch davor, wenn die Zeile nicht leer ist", () => {
    const r = insertTodoItem("Text", 4);
    expect(r.value).toBe("Text\n" + UNCHECKED);
  });
});

describe("applyTodoEnter", () => {
  it("erzeugt nach einem Punkt mit Text den nächsten Punkt", () => {
    const value = "☐ Milch";
    const r = applyTodoEnter(value, value.length);
    expect(r).not.toBeNull();
    expect(r!.value).toBe("☐ Milch\n☐ ");
  });

  it("beendet die Liste bei leerem Punkt (Marker entfernt)", () => {
    const value = "☐ ";
    const r = applyTodoEnter(value, value.length);
    expect(r).not.toBeNull();
    expect(r!.value).toBe("");
  });

  it("liefert null außerhalb einer To-do-Zeile (normaler Enter)", () => {
    expect(applyTodoEnter("nur text", 3)).toBeNull();
  });
});

describe("toggleTodoAt", () => {
  it("hakt einen offenen Punkt ab", () => {
    const value = "☐ Brot";
    expect(toggleTodoAt(value, 2)!.value).toBe("☑ Brot");
  });

  it("hakt einen erledigten Punkt wieder an", () => {
    const value = "☑ Brot";
    expect(toggleTodoAt(value, 2)!.value).toBe("☐ Brot");
  });
});
