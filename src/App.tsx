import { useCallback, useEffect, useRef, useState } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import type { Note } from "./types/note";
import { useNotes } from "./hooks/useNotes";
import { Sidebar } from "./components/Sidebar";
import { Editor, type EditorHandle } from "./components/Editor";
import { NoteModal } from "./components/NoteModal";

export default function App() {
  const notes = useNotes();
  const [preview, setPreview] = useState<Note | null>(null);
  const editorRef = useRef<EditorHandle>(null);

  const {
    visibleNotes,
    loading,
    error,
    clearError,
    tab,
    setTab,
    selectedId,
    setSelectedId,
    selectedNote,
    addNote,
    addFromTemplate,
    persistNote,
    removeNote,
    toggleTemplate,
    setNoteColor,
  } = notes;

  // Globale Shortcuts: ⌘/Ctrl+S speichern, ⌘/Ctrl+N neue Notiz.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        editorRef.current?.saveNow();
      } else if (key === "n") {
        e.preventDefault();
        void addNote();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addNote]);

  // Fehler-Toast automatisch ausblenden.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 4500);
    return () => clearTimeout(t);
  }, [error, clearError]);

  const openInEditor = useCallback(
    (id: number) => {
      setSelectedId(id);
      setPreview(null);
    },
    [setSelectedId],
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        notes={visibleNotes}
        tab={tab}
        onTab={setTab}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPreview={setPreview}
        onNew={() => void addNote()}
        loading={loading}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-surface">
        {/* Drag-Strip (macOS Titelbar) über dem Inhalt */}
        <div className="drag h-7 shrink-0" />

        {selectedNote ? (
          <Editor
            ref={editorRef}
            key={selectedNote.id}
            note={selectedNote}
            onPersist={persistNote}
            onDelete={removeNote}
            onToggleTemplate={toggleTemplate}
            onColor={setNoteColor}
            onCreateFromTemplate={addFromTemplate}
          />
        ) : (
          <EmptyState onNew={() => void addNote()} hasNotes={visibleNotes.length > 0} />
        )}
      </main>

      <NoteModal note={preview} onClose={() => setPreview(null)} onEdit={openInEditor} />

      {error && (
        <div
          role="alert"
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-sm border border-[#D85A30]/40 bg-surface px-4 py-2.5 shadow-[0_12px_30px_-12px_rgba(26,26,26,0.4)] animate-[pop_140ms_ease-out]"
        >
          <IconAlertTriangle size={16} className="text-[#D85A30]" />
          <span className="text-[0.82rem] text-ink">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="rounded-sm p-0.5 text-muted hover:text-ink"
            aria-label="Schließen"
          >
            <IconX size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  onNew,
  hasNotes,
}: {
  onNew: () => void;
  hasNotes: boolean;
}) {
  return (
    <div className="flex flex-1 select-none flex-col items-center justify-center gap-4 text-center">
      <div className="font-mono text-2xl font-medium tracking-tight text-ink">
        eNote
      </div>
      <p className="label max-w-[15rem] leading-relaxed text-faint">
        {hasNotes
          ? "Wähle links eine Notiz aus"
          : "Noch keine Notiz vorhanden"}
      </p>
      <button
        type="button"
        onClick={onNew}
        className="label rounded-sm border border-ink bg-ink px-3.5 py-2 text-surface transition-colors hover:bg-ink/85"
      >
        Neue Notiz · ⌘N
      </button>
    </div>
  );
}
