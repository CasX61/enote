import Database from "@tauri-apps/plugin-sql";
import type { Note, NoteCreate, NoteUpdate } from "../types/note";

/**
 * Einzige Kapsel der Tauri-/SQL-API. Komponenten und Hooks sprechen nur
 * über diese Funktionen mit der Datenbank — niemals direkt über invoke().
 */

let dbPromise: Promise<Database> | null = null;

async function getDb(): Promise<Database> {
  if (!dbPromise) {
    // Tauri-managed Pfad (macOS: ~/Library/Application Support/com.enote.app/notes.db)
    dbPromise = Database.load("sqlite:notes.db");
  }
  return dbPromise;
}

/** Roh-Zeile aus SQLite: is_template kommt als 0/1 zurück. */
interface NoteRow {
  id: number;
  title: string;
  content: string;
  color: string;
  is_template: number;
  created_at: string;
  updated_at: string;
}

/** SQLite-Zeile → typisierte Note (0/1 → boolean casten). */
export function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    color: row.color,
    is_template: row.is_template === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDb();
  const rows = await db.select<NoteRow[]>(
    "SELECT * FROM notes ORDER BY updated_at DESC, id DESC",
  );
  return rows.map(rowToNote);
}

export async function getNoteById(id: number): Promise<Note | null> {
  const db = await getDb();
  const rows = await db.select<NoteRow[]>(
    "SELECT * FROM notes WHERE id = $1",
    [id],
  );
  return rows.length > 0 ? rowToNote(rows[0]) : null;
}

export async function createNote(data: NoteCreate): Promise<number> {
  const db = await getDb();
  const result = await db.execute(
    "INSERT INTO notes (title, content, color, is_template) VALUES ($1, $2, $3, $4)",
    [data.title, data.content, data.color, data.is_template ? 1 : 0],
  );
  return result.lastInsertId ?? -1;
}

export async function updateNote(data: NoteUpdate): Promise<void> {
  const db = await getDb();

  // Nur übergebene Felder aktualisieren — dynamisch zusammensetzen.
  const sets: string[] = [];
  const values: Array<string | number> = [];
  let i = 1;

  if (data.title !== undefined) {
    sets.push(`title = $${i++}`);
    values.push(data.title);
  }
  if (data.content !== undefined) {
    sets.push(`content = $${i++}`);
    values.push(data.content);
  }
  if (data.color !== undefined) {
    sets.push(`color = $${i++}`);
    values.push(data.color);
  }
  if (data.is_template !== undefined) {
    sets.push(`is_template = $${i++}`);
    values.push(data.is_template ? 1 : 0);
  }

  if (sets.length === 0) return; // nichts zu tun

  values.push(data.id);
  await db.execute(
    `UPDATE notes SET ${sets.join(", ")} WHERE id = $${i}`,
    values,
  );
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM notes WHERE id = $1", [id]);
}
