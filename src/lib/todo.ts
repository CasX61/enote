/**
 * To-do-Listen im Klartext-`<textarea>`.
 * Ein Punkt ist eine Zeile der Form "☐ Text" (offen) bzw. "☑ Text" (erledigt),
 * optional mit führender Einrückung. Reine Funktionen → leicht testbar.
 */

export const UNCHECKED = "☐ ";
export const CHECKED = "☑ ";

const TODO_LINE = /^(\s*)([☐☑]) (.*)$/;
const TODO_MARKER = /^(\s*)([☐☑]) /;

export interface EditResult {
  value: string;
  caret: number;
}

function lineBounds(value: string, caret: number): [number, number] {
  const start = value.lastIndexOf("\n", caret - 1) + 1;
  const nl = value.indexOf("\n", caret);
  const end = nl === -1 ? value.length : nl;
  return [start, end];
}

/** Fügt am Cursor einen neuen To-do-Punkt ein (ggf. in neuer Zeile). */
export function insertTodoItem(value: string, caret: number): EditResult {
  const atLineStart = caret === 0 || value[caret - 1] === "\n";
  const insert = (atLineStart ? "" : "\n") + UNCHECKED;
  return {
    value: value.slice(0, caret) + insert + value.slice(caret),
    caret: caret + insert.length,
  };
}

/**
 * Enter-Verhalten innerhalb einer To-do-Liste.
 * - Punkt mit Text → neuer Punkt in der nächsten Zeile.
 * - Leerer Punkt    → Marker entfernen, Liste beenden (normal weiterschreiben).
 * - Keine To-do-Zeile → null (Standard-Enter ausführen lassen).
 */
export function applyTodoEnter(value: string, caret: number): EditResult | null {
  const [start, end] = lineBounds(value, caret);
  const m = value.slice(start, end).match(TODO_LINE);
  if (!m) return null;

  const indent = m[1];
  const rest = m[3];

  if (rest.trim() === "") {
    // Leerer Punkt → Marker weg, Liste beenden.
    return {
      value: value.slice(0, start) + indent + value.slice(end),
      caret: start + indent.length,
    };
  }

  const insert = "\n" + indent + UNCHECKED;
  return {
    value: value.slice(0, caret) + insert + value.slice(caret),
    caret: caret + insert.length,
  };
}

/** Hakt den To-do-Punkt der aktuellen Zeile ab bzw. wieder an. */
export function toggleTodoAt(value: string, caret: number): EditResult | null {
  const [start, end] = lineBounds(value, caret);
  const m = value.slice(start, end).match(TODO_MARKER);
  if (!m) return null;

  const pos = start + m[1].length;
  const next = value[pos] === "☐" ? "☑" : "☐";
  return {
    value: value.slice(0, pos) + next + value.slice(pos + 1),
    caret,
  };
}
