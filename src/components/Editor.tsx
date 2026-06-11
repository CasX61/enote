import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
  IconX,
  IconCopyPlus,
  IconListCheck,
} from "@tabler/icons-react";
import type { Note, NoteUpdate } from "../types/note";
import { useAutoSave, type SaveStatus } from "../hooks/useAutoSave";
import { wordCount } from "../lib/text";
import {
  applyTodoEnter,
  insertTodoItem,
  toggleTodoAt,
  type EditResult,
} from "../lib/todo";
import { ColorPicker } from "./ColorPicker";

export interface EditorHandle {
  saveNow: () => void;
}

interface EditorProps {
  note: Note;
  onPersist: (id: number, patch: Omit<NoteUpdate, "id">) => Promise<void>;
  onDelete: (id: number) => void;
  onToggleTemplate: (id: number) => void;
  onColor: (id: number, color: string) => void;
  onCreateFromTemplate: (id: number) => void;
}

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Nicht gespeichert",
  saving: "Speichert…",
  saved: "Gespeichert",
  error: "Fehler beim Speichern",
};

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { note, onPersist, onDelete, onToggleTemplate, onColor, onCreateFromTemplate },
  ref,
) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);

  // Notiz von außen gewechselt → Draft neu setzen. NUR hier wird der
  // textarea-/input-Wert ersetzt → Cursor bleibt beim Tippen unberührt.
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setConfirmDelete(false);
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cursor-Position nach programmatischer Änderung (To-do-Logik) wiederherstellen.
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && textareaRef.current) {
      const pos = pendingCaret.current;
      textareaRef.current.selectionStart = pos;
      textareaRef.current.selectionEnd = pos;
      pendingCaret.current = null;
    }
  });

  const { status, saveNow } = useAutoSave(
    note.id,
    { title, content },
    (val) => onPersist(note.id, val),
  );

  useImperativeHandle(ref, () => ({ saveNow: () => void saveNow() }), [saveNow]);

  // Ergebnis einer To-do-Operation anwenden: Inhalt + Cursor setzen.
  const apply = (res: EditResult) => {
    setContent(res.value);
    pendingCaret.current = res.caret;
  };

  const insertTodo = () => {
    const ta = textareaRef.current;
    const caret = ta ? ta.selectionStart : content.length;
    apply(insertTodoItem(content, caret));
    ta?.focus();
  };

  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const caret = ta.selectionStart;
    const mod = e.metaKey || e.ctrlKey;

    // ⌘L: To-do einfügen
    if (mod && e.key.toLowerCase() === "l") {
      e.preventDefault();
      insertTodo();
      return;
    }
    // ⌘↵: aktuellen Punkt ab-/anhaken
    if (mod && e.key === "Enter") {
      const res = toggleTodoAt(content, caret);
      if (res) {
        e.preventDefault();
        apply(res);
      }
      return;
    }
    // ↵ innerhalb einer To-do-Liste: nächster Punkt / Liste beenden
    if (e.key === "Enter" && !e.shiftKey && ta.selectionStart === ta.selectionEnd) {
      const res = applyTodoEnter(content, caret);
      if (res) {
        e.preventDefault();
        apply(res);
      }
    }
  };

  const words = wordCount(content);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-line px-6 py-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel"
          aria-label="Titel"
          className="min-w-0 flex-1 bg-transparent text-lg font-medium text-ink placeholder:text-faint focus:outline-none"
        />

        <div className="flex shrink-0 items-center gap-3">
          <ColorPicker
            value={note.color}
            onChange={(hex) => onColor(note.id, hex)}
          />

          <span className="h-5 w-px bg-line" />

          <button
            type="button"
            onClick={insertTodo}
            title="To-do-Liste (⌘L) · abhaken mit ⌘↵"
            className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <IconListCheck size={18} />
          </button>

          <button
            type="button"
            onClick={() => onToggleTemplate(note.id)}
            title={note.is_template ? "Vorlage entfernen" : "Als Vorlage"}
            aria-pressed={note.is_template}
            className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {note.is_template ? (
              <IconBookmarkFilled size={18} />
            ) : (
              <IconBookmark size={18} />
            )}
          </button>

          {confirmDelete ? (
            <span className="flex items-center gap-1">
              <span className="label text-faint">Löschen?</span>
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                title="Löschen bestätigen"
                className="rounded-sm p-1.5 text-[#D85A30] transition-colors hover:bg-[#D85A30]/10"
              >
                <IconCheck size={18} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                title="Abbrechen"
                className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5"
              >
                <IconX size={18} />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Notiz löschen"
              className="rounded-sm p-1.5 text-muted transition-colors hover:bg-[#D85A30]/10 hover:text-[#D85A30]"
            >
              <IconTrash size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={() => void saveNow()}
            title="Speichern (⌘S)"
            className="rounded-sm p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <IconDeviceFloppy size={18} />
          </button>
        </div>
      </div>

      {/* Vorlagen-Hinweis */}
      {note.is_template && (
        <div className="flex items-center justify-between border-b border-line bg-bg px-6 py-2">
          <span className="label text-faint">Diese Notiz ist eine Vorlage</span>
          <button
            type="button"
            onClick={() => onCreateFromTemplate(note.id)}
            className="flex items-center gap-1.5 rounded-sm border border-line bg-surface px-2.5 py-1 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-surface"
          >
            <IconCopyPlus size={13} />
            <span className="label">Notiz daraus erstellen</span>
          </button>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onTextareaKeyDown}
        placeholder="Schreib los…  ·  ⌘L für eine To-do-Liste"
        aria-label="Inhalt"
        spellCheck={false}
        className="scroll-thin min-h-0 flex-1 resize-none bg-transparent px-6 py-5 text-[0.95rem] leading-relaxed text-ink placeholder:text-faint focus:outline-none"
      />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-line px-6 py-2.5">
        <span className="label text-faint">
          {words} {words === 1 ? "Wort" : "Wörter"}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
});

function StatusBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") {
    return <span className="label text-faint">·</span>;
  }
  const isSaved = status === "saved";
  const isError = status === "error";
  return (
    <span
      className={[
        "label flex items-center gap-1.5",
        isError ? "text-[#D85A30]" : isSaved ? "text-[#1D9E75]" : "text-muted",
      ].join(" ")}
    >
      {isSaved && <IconCheck size={12} />}
      {STATUS_TEXT[status]}
    </span>
  );
}
