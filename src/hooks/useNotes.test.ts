import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { Note } from "../types/note";
import { useNotes } from "./useNotes";

const sample: Note[] = [
  {
    id: 1,
    title: "Notiz",
    content: "",
    color: "#888780",
    is_template: false,
    created_at: "2026-06-11 10:00:00",
    updated_at: "2026-06-11 10:00:00",
  },
  {
    id: 2,
    title: "Vorlage",
    content: "",
    color: "#378ADD",
    is_template: true,
    created_at: "2026-06-11 09:00:00",
    updated_at: "2026-06-11 09:00:00",
  },
];

vi.mock("../lib/db", () => ({
  getAllNotes: vi.fn(() => Promise.resolve(sample)),
  createNote: vi.fn(() => Promise.resolve(99)),
  updateNote: vi.fn(() => Promise.resolve()),
  deleteNote: vi.fn(() => Promise.resolve()),
  getNoteById: vi.fn(() => Promise.resolve(null)),
}));

describe("useNotes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lädt Notizen und filtert nach Tab", async () => {
    const { result } = renderHook(() => useNotes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Standard-Tab "notes": nur Nicht-Vorlagen.
    expect(result.current.visibleNotes.map((n) => n.id)).toEqual([1]);

    act(() => result.current.setTab("templates"));
    expect(result.current.visibleNotes.map((n) => n.id)).toEqual([2]);
  });

  it("löscht eine Notiz optimistisch aus dem State", async () => {
    const { result } = renderHook(() => useNotes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeNote(1);
    });

    expect(result.current.notes.find((n) => n.id === 1)).toBeUndefined();
  });
});
