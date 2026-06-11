import { useCallback, useEffect, useMemo, useState } from "react";
import type { Note, NoteUpdate } from "../types/note";
import { DEFAULT_NOTE_COLOR } from "../types/note";
import * as db from "../lib/db";

export type Tab = "notes" | "templates";

export interface UseNotes {
  notes: Note[];
  visibleNotes: Note[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  tab: Tab;
  setTab: (tab: Tab) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  selectedNote: Note | null;
  refresh: () => Promise<void>;
  addNote: () => Promise<void>;
  addFromTemplate: (templateId: number) => Promise<void>;
  persistNote: (id: number, patch: Omit<NoteUpdate, "id">) => Promise<void>;
  removeNote: (id: number) => Promise<void>;
  toggleTemplate: (id: number) => Promise<void>;
  setNoteColor: (id: number, color: string) => Promise<void>;
}

function nowIso(): string {
  // SQLite datetime('now') liefert UTC ohne Zeitzone — Format angleichen.
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function useNotes(): UseNotes {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("notes");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fail = useCallback((message: string, e: unknown) => {
    console.error(message, e);
    setError(message);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const all = await db.getAllNotes();
      setNotes(all);
    } catch (e) {
      fail("Notizen konnten nicht geladen werden.", e);
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const visibleNotes = useMemo(
    () => notes.filter((n) => n.is_template === (tab === "templates")),
    [notes, tab],
  );

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  const addNote = useCallback(async () => {
    try {
      const data = {
        title: "",
        content: "",
        color: DEFAULT_NOTE_COLOR,
        is_template: tab === "templates",
      };
      const id = await db.createNote(data);
      const created: Note = {
        id,
        ...data,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      setNotes((prev) => [created, ...prev]);
      setSelectedId(id);
    } catch (e) {
      fail("Notiz konnte nicht erstellt werden.", e);
    }
  }, [tab, fail]);

  const addFromTemplate = useCallback(
    async (templateId: number) => {
      const tpl = notes.find((n) => n.id === templateId);
      if (!tpl) return;
      try {
        const data = {
          title: tpl.title,
          content: tpl.content,
          color: tpl.color,
          is_template: false,
        };
        const id = await db.createNote(data);
        const created: Note = {
          id,
          ...data,
          created_at: nowIso(),
          updated_at: nowIso(),
        };
        setNotes((prev) => [created, ...prev]);
        setTab("notes");
        setSelectedId(id);
      } catch (e) {
        fail("Notiz aus Vorlage konnte nicht erstellt werden.", e);
      }
    },
    [notes, fail],
  );

  // Lokal aktualisieren (optimistic) + persistieren. Reihenfolge bleibt stabil
  // (kein Umsortieren beim Tippen), nur updated_at wird gesetzt.
  const persistNote = useCallback(
    async (id: number, patch: Omit<NoteUpdate, "id">) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...patch, updated_at: nowIso() } : n,
        ),
      );
      try {
        await db.updateNote({ id, ...patch });
      } catch (e) {
        fail("Änderung konnte nicht gespeichert werden.", e);
        throw e; // an Aufrufer (Auto-Save) weiterreichen für Status "error"
      }
    },
    [fail],
  );

  const removeNote = useCallback(
    async (id: number) => {
      const prevNotes = notes;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
      try {
        await db.deleteNote(id);
      } catch (e) {
        setNotes(prevNotes); // rollback
        fail("Notiz konnte nicht gelöscht werden.", e);
      }
    },
    [notes, selectedId, fail],
  );

  const toggleTemplate = useCallback(
    async (id: number) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      try {
        await persistNote(id, { is_template: !note.is_template });
      } catch {
        /* Fehler wird bereits in persistNote gemeldet */
      }
    },
    [notes, persistNote],
  );

  const setNoteColor = useCallback(
    async (id: number, color: string) => {
      try {
        await persistNote(id, { color });
      } catch {
        /* Fehler wird bereits in persistNote gemeldet */
      }
    },
    [persistNote],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    notes,
    visibleNotes,
    loading,
    error,
    clearError,
    tab,
    setTab,
    selectedId,
    setSelectedId,
    selectedNote,
    refresh,
    addNote,
    addFromTemplate,
    persistNote,
    removeNote,
    toggleTemplate,
    setNoteColor,
  };
}
