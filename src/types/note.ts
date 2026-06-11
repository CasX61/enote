export interface Note {
  id: number;
  title: string;
  content: string;
  color: string; // Hex-Wert, z.B. "#378ADD"
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export type NoteCreate = Omit<Note, "id" | "created_at" | "updated_at">;
export type NoteUpdate = Partial<NoteCreate> & { id: number };

export interface NoteColor {
  name: string;
  hex: string;
}

export const NOTE_COLORS: readonly NoteColor[] = [
  { name: "Grau", hex: "#888780" },
  { name: "Blau", hex: "#378ADD" },
  { name: "Grün", hex: "#1D9E75" },
  { name: "Gelb", hex: "#EF9F27" },
  { name: "Orange", hex: "#D85A30" },
  { name: "Pink", hex: "#D4537E" },
  { name: "Lila", hex: "#7F77DD" },
] as const;

export const DEFAULT_NOTE_COLOR = NOTE_COLORS[0].hex;
