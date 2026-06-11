import { IconBookmarkFilled } from "@tabler/icons-react";
import type { Note } from "../types/note";
import { snippet, formatDate } from "../lib/text";

interface NoteCardProps {
  note: Note;
  active: boolean;
  onSelect: (id: number) => void;
  onPreview: (note: Note) => void;
}

/** Einzelne Card: Akzent als linker Spine, Titel, Snippet, Mono-Meta. */
export function NoteCard({ note, active, onSelect, onPreview }: NoteCardProps) {
  const title = note.title.trim() || "Ohne Titel";
  const preview = snippet(note.content);

  return (
    <button
      type="button"
      onClick={() => onSelect(note.id)}
      onDoubleClick={() => onPreview(note)}
      aria-current={active}
      className={[
        "group relative w-full overflow-hidden rounded-sm border bg-surface px-3 py-2.5 text-left",
        "transition-colors duration-100",
        active
          ? "border-ink/25 shadow-[inset_0_0_0_1px_rgba(26,26,26,0.06)]"
          : "border-line hover:border-ink/20",
      ].join(" ")}
      style={{ borderLeftColor: note.color, borderLeftWidth: 6 }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={[
            "truncate text-[0.875rem] font-medium leading-tight",
            note.title.trim() ? "text-ink" : "text-faint italic",
          ].join(" ")}
        >
          {title}
        </h3>
        {note.is_template && (
          <IconBookmarkFilled
            size={13}
            className="mt-0.5 shrink-0 text-faint"
            aria-label="Vorlage"
          />
        )}
      </div>

      <p className="mt-1 line-clamp-2 text-[0.78rem] leading-snug text-muted">
        {preview || <span className="text-faint">Keine weiteren Inhalte</span>}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: note.color }}
        />
        <span className="label text-faint">{formatDate(note.updated_at)}</span>
      </div>
    </button>
  );
}
