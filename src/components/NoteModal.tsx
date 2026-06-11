import { useEffect } from "react";
import { IconPencil, IconX } from "@tabler/icons-react";
import type { Note } from "../types/note";
import { formatDate, wordCount } from "../lib/text";

interface NoteModalProps {
  note: Note | null;
  onClose: () => void;
  onEdit: (id: number) => void;
}

/** Read-only Vorschau bei Doppelklick. Schließt per Backdrop oder Escape. */
export function NoteModal({ note, onClose, onEdit }: NoteModalProps) {
  useEffect(() => {
    if (!note) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [note, onClose]);

  if (!note) return null;

  const title = note.title.trim() || "Ohne Titel";
  const words = wordCount(note.content);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 p-8 backdrop-blur-[2px] animate-[fade_120ms_ease-out]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[78vh] w-full max-w-xl flex-col overflow-hidden rounded-sm border border-line bg-surface shadow-[0_24px_60px_-20px_rgba(26,26,26,0.35)] animate-[pop_140ms_ease-out]"
        style={{ borderLeftColor: note.color, borderLeftWidth: 6 }}
      >
        {/* Kopf */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2
              className={[
                "truncate text-lg font-medium",
                note.title.trim() ? "text-ink" : "italic text-faint",
              ].join(" ")}
            >
              {title}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: note.color }}
              />
              <span className="label text-faint">
                {formatDate(note.updated_at)} · {words}{" "}
                {words === 1 ? "Wort" : "Wörter"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Schließen (Esc)"
            className="shrink-0 rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Inhalt */}
        <div className="scroll-thin flex-1 overflow-y-auto px-6 py-5">
          {note.content.trim() ? (
            <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink">
              {note.content}
            </p>
          ) : (
            <p className="label text-faint">Keine Inhalte</p>
          )}
        </div>

        {/* Fuß */}
        <div className="flex justify-end gap-2 border-t border-line px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="label rounded-sm border border-line px-3 py-1.5 text-muted transition-colors hover:border-ink/30 hover:text-ink"
          >
            Schließen
          </button>
          <button
            type="button"
            onClick={() => onEdit(note.id)}
            className="label flex items-center gap-1.5 rounded-sm border border-ink bg-ink px-3 py-1.5 text-surface transition-colors hover:bg-ink/85"
          >
            <IconPencil size={13} />
            Bearbeiten
          </button>
        </div>
      </div>
    </div>
  );
}
