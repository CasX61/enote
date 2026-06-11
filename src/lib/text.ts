/** Zählt Wörter robust (mehrere Leerzeichen/Zeilenumbrüche ignorieren). */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Kurzvorschau des Inhalts für die Card. */
export function snippet(text: string, max = 120): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max).trimEnd() + "…";
}

/** SQLite-Timestamp ("YYYY-MM-DD HH:MM:SS", UTC) → kurzes lokales Datum. */
export function formatDate(iso: string): string {
  const normalized = iso.includes("T") ? iso : iso.replace(" ", "T") + "Z";
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
